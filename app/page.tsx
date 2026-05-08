"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

export default function AudioInsightApp() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // This calls your /app/api/generate/route.ts
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to process audio");

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError("Something went wrong. Please check your API key and file format.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const margin = 15;
    let cursorY = 20;

    // --- Title ---
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Executive Summary", margin, cursorY);
    cursorY += 15;

    // --- Summary ---
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const summaryLines = doc.splitTextToSize(data.executive_summary, 180);
    doc.text(summaryLines, margin, cursorY);
    cursorY += (summaryLines.length * 7) + 10;

    // --- Key Takeaways ---
    doc.setFontSize(16);
    doc.text("Key Takeaways", margin, cursorY);
    cursorY += 10;
    doc.setFontSize(12);
    data.key_takeaways.forEach((point: string) => {
      const pointLines = doc.splitTextToSize(`• ${point}`, 175);
      doc.text(pointLines, margin, cursorY);
      cursorY += (pointLines.length * 7);
    });

    // --- Flashcards Page ---
    doc.addPage();
    cursorY = 20;
    doc.setFontSize(16);
    doc.text("Study Flashcards", margin, cursorY);
    cursorY += 15;

    doc.setFontSize(11);
    data.flashcards.forEach((card: any, i: number) => {
      // Draw a simple box for the flashcard
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, cursorY, 180, 25);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Q: ${card.front}`, margin + 5, cursorY + 10);
      
      doc.setFont("helvetica", "normal");
      doc.text(`A: ${card.back}`, margin + 5, cursorY + 18);
      
      cursorY += 35; // Space for next card
    });

    doc.save("Executive_Summary.pdf");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audio Insight AI</h1>
        <p className="text-gray-500 mb-8">Upload audio to generate summaries and flashcards.</p>

        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center mb-8">
          <input
            type="file"
            accept="audio/*"
            onChange={handleUpload}
            className="hidden"
            id="audio-upload"
            disabled={isLoading}
          />
          <label
            htmlFor="audio-upload"
            className={`cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Processing Audio..." : "Select Audio File"}
          </label>
          {isLoading && (
            <p className="mt-4 text-sm text-blue-600 animate-pulse">
              Gemini is transcribing and analyzing...
            </p>
          )}
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Results Section */}
        {data && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Executive Summary</h2>
              <p className="text-gray-700 leading-relaxed">{data.executive_summary}</p>
            </div>

            <button
              onClick={downloadPDF}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg transition-all"
            >
              Download PDF Report
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
