import React from "react";
import { Upload, FileSpreadsheet, Download, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

export default function ExcelUploadTab({
  excelFile,
  setExcelFile,
  uploadedResults,
  setUploadedResults,
}) {
  // Download Template Function
  const downloadTemplate = () => {
    const template = [
      {
        matricNumber: "21010304950",
        testScore: 25,
        examScore: 60,
      },
      {
        matricNumber: "21010306003",
        testScore: 28,
        examScore: 65,
      },
      {
        matricNumber: "2021/003",
        testScore: 22,
        examScore: 58,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "results_upload_template.xlsx");
    toast.success("Template downloaded successfully!");
  };

  // Handle Excel Upload
  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const parsedResults = data.map((row) => ({
          matricNumber:
            row.matricNumber || row.MatricNumber || row.matric_number || "",
          testScore: row.testScore || row.TestScore || row.test_score || "",
          examScore: row.examScore || row.ExamScore || row.exam_score || "",
        }));

        if (parsedResults.length > 0) {
          setUploadedResults(parsedResults);
          toast.success(`${parsedResults.length} results loaded from file`);
        } else {
          toast.error("No valid result data found in file");
        }
      } catch (error) {
        toast.error("Error reading file. Please check the format.");
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Preview limit
  const PREVIEW_LIMIT = 5;
  const previewResults = uploadedResults.slice(0, PREVIEW_LIMIT);
  const hasMore = uploadedResults.length > PREVIEW_LIMIT;

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-200">
          <FileSpreadsheet className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Excel File
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Upload an Excel file with student results
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <label className="inline-block cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
            />
            <div className="px-6 py-2 bg-[#006ef5] text-white rounded-lg font-semibold hover:bg-[#0052cc] transition-colors inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Choose File
            </div>
          </label>

          <button
            onClick={downloadTemplate}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>

        {excelFile && (
          <div className="mt-6 flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{excelFile.name}</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800 font-medium mb-2">
          Excel File Format:
        </p>
        <p className="text-sm text-blue-700">
          Required Columns: <strong>matricNumber</strong>,{" "}
          <strong>testScore</strong>, <strong>examScore</strong>
        </p>
      </div>

      {uploadedResults.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">
              Total Results: {uploadedResults.length}
            </p>
            {hasMore && (
              <p className="text-xs text-gray-500">
                Showing first {PREVIEW_LIMIT} of {uploadedResults.length}
              </p>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {previewResults.map((result, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 text-sm flex justify-between items-center"
              >
                <span className="font-medium text-gray-900">
                  {result.matricNumber}
                </span>
                <div className="flex gap-4">
                  <span className="text-gray-600">
                    Test: <strong>{result.testScore}</strong>
                  </span>
                  <span className="text-gray-600">
                    Exam: <strong>{result.examScore}</strong>
                  </span>
                  <span className="text-[#006ef5] font-semibold">
                    Total:{" "}
                    {(parseFloat(result.testScore) || 0) +
                      (parseFloat(result.examScore) || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500 italic">
                ... and {uploadedResults.length - PREVIEW_LIMIT} more results
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}