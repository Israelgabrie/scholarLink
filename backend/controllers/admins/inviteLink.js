const fs = require("fs");
const path = require("path");
const InviteLink = require("../../schemas/inviteLink");
const User = require("../../schemas/user");
const School = require("../../schemas/school");
const { v4: uuidv4 } = require("uuid");
const sendMail = require("../../helpers/sendMail");
const { createLog } = require("../../schemas/logSchema");

const bcryptjs = require("bcryptjs");
const AWS = require("aws-sdk");

const templatePath = path.join(__dirname, "../../template/invite.html");

// session format: YYYY/YYYY

async function createAndSendInvite(req, res) {
  try {
    const { userId, schoolId, users } = req.body;

    /* ---------------- BASIC VALIDATION ---------------- */
    if (!userId || !schoolId || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
      });
    }

    const sender = await User.findById(userId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    /* ---------------- EMAIL DUPLICATE CHECK ---------------- */
    const normalizedEmails = users
      .map((u) => u.email?.trim().toLowerCase())
      .filter(Boolean);

    if (new Set(normalizedEmails).size !== normalizedEmails.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate emails found in request",
      });
    }

    const existingUsers = await User.find({ email: { $in: normalizedEmails } });
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Emails already exist: ${existingUsers
          .map((u) => u.email)
          .join(", ")}`,
      });
    }

    /* ---------------- MATRIC NUMBER & CLASSNAME CHECK (STUDENTS ONLY) ---------------- */
    const studentMatricNumbers = users
      .filter((u) => u.role === "student" && u.matricNumber)
      .map((u) => u.matricNumber?.trim());

    if (new Set(studentMatricNumbers).size !== studentMatricNumbers.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate matric numbers found in request",
      });
    }

    if (studentMatricNumbers.length > 0) {
      const existingMatric = await User.find({
        matricNumber: { $in: studentMatricNumbers },
        school: school._id, // only check within the same school
      });
      if (existingMatric.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Matric numbers already exist in this school: ${existingMatric
            .map((u) => u.matricNumber)
            .join(", ")}`,
        });
      }
    }

    /* ---------------- SESSION & CLASSNAME VALIDATION ---------------- */
    const SESSION_REGEX = /^\d{4}\/\d{4}$/;
    for (const u of users) {
      const name = u.name?.trim();
      const email = u.email?.trim().toLowerCase();
      const department = u.department?.trim();
      const program = u.program?.trim();
      const matricNumber = u.matricNumber?.trim();
      const session = u.session?.trim();
      const className = u.className?.trim();

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Each user must have a name",
        });
      }

      if (!session || !SESSION_REGEX.test(session)) {
        return res.status(400).json({
          success: false,
          message: `Invalid session for ${name}. Must be YYYY/YYYY format`,
        });
      }

      if (u.role === "student" && !className) {
        return res.status(400).json({
          success: false,
          message: `ClassName is required for student ${name}`,
        });
      }

      // Update trimmed values back to the user object for saving
      u.name = name;
      u.email = email;
      u.department = department;
      u.program = program;
      u.matricNumber = matricNumber;
      u.session = session;
      u.className = className;
    }

    /* ---------------- READ EMAIL TEMPLATE ---------------- */
    const template = fs.readFileSync(templatePath, "utf-8");

    /* ---------------- CREATE INVITES, SEND EMAILS, AND LOG ---------------- */
    const savedInvites = [];

    for (const u of users) {
      const {
        name,
        email,
        role,
        department,
        matricNumber,
        program,
        session,
        className,
      } = u;

      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const invite = new InviteLink({
        inviteToken: token,
        email,
        name,
        role,
        matricNumber: role === "student" ? matricNumber || "" : "",
        department: role === "student" ? department || "" : "",
        program: program || "",
        session,
        className: role === "student" ? className || "" : "",
        school: school._id,
        createdBy: sender._id,
        expiresAt,
      });

      await invite.save();
      savedInvites.push(invite);

      const signupUrl = `${process.env.FRONTEND_URL}/create-account?token=${token}`;
      const htmlContent = template
        .replace(/{{recipient_name}}/g, name)
        .replace(/{{role}}/g, role)
        .replace(/{{inviter_name}}/g, sender.fullName)
        .replace(/{{registration_link}}/g, signupUrl);

      await sendMail({
        toEmail: email,
        toName: name,
        subject: `Invitation to join ${school.name}`,
        htmlContent,
      });

      // ---------------- CREATE LOG ----------------
      await createLog({
        title: `Invite sent to ${name}`,
        content: `An invitation email was sent to ${name} (${email}) for role ${role} in ${school.name}.`,
        action: "INVITE_SENT",
        actor: sender._id,
        involvedUsers: [], // can add the invited user's ID if already saved in DB
        level: "INFO",
        meta: { inviteId: invite._id, token, schoolId: school._id },
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "All invites created, emails sent, and logs recorded successfully",
      invites: savedInvites,
    });
  } catch (error) {
    console.error("Invite creation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getInvites(req, res) {
  try {
    const { userId, search, size = 30, lastId, startDate, endDate } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    const sender = await User.findById(userId);
    if (!sender) {
      return res
        .status(404)
        .json({ success: false, message: "Sender not found" });
    }

    const schoolId = sender.school;
    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "Sender has no school assigned" });
    }

    const query = { school: schoolId };

    // Search by matric number (optional)
    if (search) {
      query.matricNumber = { $regex: search, $options: "i" };
    }

    // Filter by creation date range (optional)
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Infinite scroll: only get docs after lastId
    if (lastId) {
      const lastInvite = await InviteLink.findById(lastId);
      if (lastInvite) {
        query._id = { $gt: lastInvite._id };
      }
    }

    const invites = await InviteLink.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(size));

    return res.status(200).json({
      success: true,
      message: "Invites fetched successfully",
      invites,
    });
  } catch (error) {
    console.error("Get invites error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


// Edit an invite
async function editInvite(req, res) {
  try {
    let {
      userId,
      inviteId,
      name,
      matricNumber,
      department,
      program,
      session,
      className, // added className
      role, // needed to determine if className is required
    } = req.body;

    // Trim all string inputs
    userId = userId?.trim();
    inviteId = inviteId?.trim();
    name = name?.trim();
    matricNumber = matricNumber?.trim();
    department = department?.trim();
    program = program?.trim();
    session = session?.trim();
    className = className?.trim();
    role = role?.trim();

    if (!userId || !inviteId) {
      return res
        .status(400)
        .json({ success: false, message: "userId and inviteId are required" });
    }

    const invite = await InviteLink.findById(inviteId);
    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found" });
    }

    if (invite.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit invites you created",
      });
    }

    if (invite.used) {
      return res.status(400).json({
        success: false,
        message:
          "This invite has been used. This operation should be done on the user.",
      });
    }

    // Validate session if provided
    if (session) {
      const SESSION_REGEX = /^\d{4}\/\d{4}$/;
      if (!SESSION_REGEX.test(session)) {
        return res.status(400).json({
          success: false,
          message: "Session must be in YYYY/YYYY format",
        });
      }
      invite.session = session;
    }

    // Update only editable fields
    if (name) invite.name = name;
    if (matricNumber) invite.matricNumber = matricNumber;
    if (department) invite.department = department;
    if (program) invite.program = program;

    // Update className for students and validate
    if (role === "student") {
      if (!className) {
        return res.status(400).json({
          success: false,
          message: "ClassName is required for students",
        });
      }
      invite.className = className;
    } else if (className) {
      // optional for non-students
      invite.className = className;
    }

    await invite.save();

    // ---------------- CREATE LOG ----------------
    await createLog({
      title: `Invite edited for ${invite.name}`,
      content: `The invite for ${invite.name} (${invite.email}) has been updated by user ${userId}. Updated fields: ${JSON.stringify({
        name,
        matricNumber,
        department,
        program,
        session,
        className,
        role,
      })}`,
      action: "UPDATE",
      actor: userId,
      involvedUsers: [], // you can optionally add the user associated with the invite
      level: "INFO",
      meta: { inviteId: invite._id },
    });

    return res.status(200).json({
      success: true,
      message: "Invite updated successfully",
      invite,
    });
  } catch (error) {
    console.error("Edit invite error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}


// Delete an invite
async function deleteInvite(req, res) {
  try {
    const { userId, inviteId } = req.body;

    if (!userId || !inviteId) {
      return res
        .status(400)
        .json({ success: false, message: "userId and inviteId are required" });
    }

    const invite = await InviteLink.findById(inviteId);
    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found" });
    }

    if (invite.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete invites you created",
      });
    }

    if (invite.used) {
      return res.status(400).json({
        success: false,
        message:
          "This invite has been used. You need permission from the user to delete it.",
      });
    }

    // Correct deletion method
    await InviteLink.deleteOne({ _id: inviteId });

    // ---------------- CREATE LOG ----------------
    await createLog({
      title: `Invite deleted for ${invite.name}`,
      content: `The invite for ${invite.name} (${invite.email}) has been deleted by user ${userId}.`,
      action: "DELETE",
      actor: userId,
      involvedUsers: [], // optionally, add the user associated with the invite
      level: "INFO",
      meta: { inviteId: invite._id },
    });

    return res
      .status(200)
      .json({ success: true, message: "Invite deleted successfully" });
  } catch (error) {
    console.error("Delete invite error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}


/* ---------------- CLOUDFARE R2 ---------------- */
const s3 = new AWS.S3({
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  region: "auto",
});

async function uploadFileToR2(buffer, fileName, mimeType) {
  const params = {
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: mimeType,
  };

  const result = await s3.upload(params).promise();
  return `${process.env.CLOUDFLARE_PUBLIC_URL}/${fileName}`;
}
async function createUserFromInvite(req, res) {
  try {
    let { password, confirmPassword, token } = req.body;

    // Trim inputs
    password = password?.trim();
    confirmPassword = confirmPassword?.trim();
    token = token?.trim();

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Invite token is required" });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword are required",
      });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    // Find the invite
    const invite = await InviteLink.findOne({ inviteToken: token });
    if (!invite)
      return res
        .status(404)
        .json({ success: false, message: "Invalid invite token" });
    if (invite.used)
      return res
        .status(400)
        .json({ success: false, message: "This invite has already been used" });

    // Ensure fullName exists in the invite
    if (!invite.name || !invite.name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invite is missing the recipient's name",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });

    const hashedPassword = await bcryptjs.hash(password, 10);

    // Handle uploaded image
    let profileImage = "";
    if (req.file) {
      const file = req.file;
      const fileName = `users/${Date.now()}_${file.originalname}`;
      profileImage = await uploadFileToR2(file.buffer, fileName, file.mimetype);
    }

    // Validate className for students
    if (
      invite.role?.trim() === "student" &&
      (!invite.className || !invite.className.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "ClassName is required for student",
      });
    }

    // Create the user
    const newUser = new User({
      fullName: invite.name.trim(),
      email: invite.email.trim(),
      password: hashedPassword,
      role: invite.role?.trim(),
      school: invite.school,
      session: invite.session?.trim() || "",
      profileImage,
      verified: true,
      ...(invite.role?.trim() === "student" && {
        department: invite.department?.trim() || "",
        program: invite.program?.trim() || "",
        matricNumber: invite.matricNumber?.trim() || "",
        className: invite.className?.trim() || "",
      }),
      ...(invite.role?.trim() !== "student" &&
        invite.className?.trim() && { className: invite.className?.trim() }),
    });

    await newUser.save();

    // Mark invite as used
    invite.used = true;
    invite.usedAt = new Date();
    await invite.save();

    // ---------------- CREATE LOG ----------------
    await createLog({
      title: `User created from invite: ${newUser.fullName}`,
      content: `A new user (${newUser.fullName}, ${newUser.email}) was created from invite ${invite._id}. Role: ${newUser.role}`,
      action: "INVITE_USED",
      actor: newUser._id, // the user themselves is now the actor
      involvedUsers: [], // optionally, you can add the invite creator's ID
      level: "INFO",
      meta: { userId: newUser._id, inviteId: invite._id, schoolId: newUser.school },
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        school: newUser.school,
        profileImage: newUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Create user from invite error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}


module.exports = {
  createAndSendInvite,
  getInvites,
  deleteInvite,
  editInvite,
  createUserFromInvite,
};
