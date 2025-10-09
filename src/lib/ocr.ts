import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";

// Use local worker
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.js",
  import.meta.url
).toString();

/**
 * Extract text from image or PDF file.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  // Image
  if (file.type.startsWith("image/")) {
    const result = await Tesseract.recognize(file, "eng", {
      logger: (m) => console.log(m),
    });
    return result.data.text;
  }

  // PDF
  if (file.type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d")!;

      // ✅ Corrected: remove `canvas`
      await page.render({ canvasContext: context, viewport }).promise;

      const dataUrl = canvas.toDataURL("image/png");
      const pageResult = await Tesseract.recognize(dataUrl, "eng", {
        logger: (m) => console.log(m),
      });

      fullText += pageResult.data.text + "\n";
    }

    return fullText;
  }

  throw new Error("Unsupported file type for OCR");
}

/**
 * Parse key certificate details from extracted text.
 */
export function parseCertificateText(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();

  return {
    studentName:
      cleaned.match(/(?:Name|Student Name|Candidate Name)[:\s]+([A-Za-z ]+)/i)?.[1]?.trim() ||
      "Unknown",

    rollNumber:
      cleaned.match(/(?:Roll\s*No|Enrollment\s*No|Registration\s*No)[:\s]+([A-Za-z0-9-]+)/i)?.[1]?.trim() ||
      "Unknown",

    course:
      cleaned.match(/(?:Course|Program|Program Name)[:\s]+([A-Za-z ]+)/i)?.[1]?.trim() ||
      "Unknown",

    institution:
      cleaned.match(/(?:University|Board|Institute|College)[:\s]+([A-Za-z ]+)/i)?.[1]?.trim() ||
      "Unknown",

    year:
      cleaned.match(/(?:Year|Passing Year|Session)[:\s]+(\d{4})/i)?.[1]?.trim() || "Unknown",

    grade:
      cleaned.match(/(?:Grade|Marks|Result)[:\s]+([A-Za-z0-9+]+)/i)?.[1]?.trim() || "Unknown",

    certificateNumber:
      cleaned.match(/(?:Certificate\s*No|Cert\s*ID|Cert\s*No)[:\s]+([A-Za-z0-9-]+)/i)?.[1]?.trim() ||
      "Unknown",
  };
}
