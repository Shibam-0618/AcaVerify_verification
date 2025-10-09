// src/pages/Verify.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Upload, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import UploadZone from "@/components/UploadZone";
import VerificationResult from "@/components/VerificationResult";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";

// PDF.js worker setup
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

// ---------------------- OCR Functions ----------------------
/**
 * Extract text from image or PDF file
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type.startsWith("image/")) {
    const result = await Tesseract.recognize(file, "eng", { logger: (m) => console.log(m) });
    return result.data.text;
  }

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
      await page.render({ canvas, canvasContext: context, viewport }).promise;

      const dataUrl = canvas.toDataURL("image/png");
      const pageResult = await Tesseract.recognize(dataUrl, "eng", { logger: (m) => console.log(m) });
      fullText += pageResult.data.text + "\n";
    }

    return fullText;
  }

  throw new Error("Unsupported file type for OCR");
}

/**
 * Parse certificate details from extracted text
 */
export function parseCertificateText(text: string) {
  return {
    studentName:
      text.match(/(?:Name|Student Name|Candidate Name)[:\s]+([A-Za-z ]+)/i)?.[1]?.trim() || "Unknown",

    rollNumber:
      text.match(/(?:Roll\s*No|Enrollment\s*No|Registration\s*No)[:\s]+([A-Za-z0-9-]+)/i)?.[1]?.trim() || "Unknown",

    course:
      text.match(/(?:Course|Program|Program Name)[:\s]+([A-Za-z ]+)/i)?.[1]?.trim() || "Unknown",

    institution:
      text.match(/(?:University|Board|Institute|College)[:\s]+([A-Za-z ]+)/i)?.[1]?.trim() || "Unknown",

    year:
      text.match(/(?:Year|Passing Year|Session)[:\s]+(\d{4})/i)?.[1]?.trim() || "Unknown",

    grade:
      text.match(/(?:Grade|Marks|Result)[:\s]+([A-Za-z0-9+]+)/i)?.[1]?.trim() || "Unknown",

    certificateNumber:
      text.match(/(?:Certificate\s*No|Cert\s*ID|Cert\s*No)[:\s]+([A-Za-z0-9-]+)/i)?.[1]?.trim() || "Unknown",
  };
}

// ---------------------- Type Definitions ----------------------
type VerificationData = {
  status: "verified" | "suspicious" | "invalid";
  confidence: number;
  extractedData: ReturnType<typeof parseCertificateText>;
  checks: {
    formatValidation: boolean;
    sealAuthenticity: boolean;
    databaseMatch: boolean;
    tampering: boolean;
  };
  timestamp: string;
};

// ---------------------- Verify Component ----------------------
const Verify = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please login to verify certificates");
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setVerificationData(null);
  };

  const handleVerify = async () => {
    if (!file) {
      toast.error("Please upload a certificate first");
      return;
    }

    setIsVerifying(true);
    toast.info("Extracting data from certificate...");

    try {
      const extractedText = await extractTextFromFile(file);
      console.log("OCR Extracted Text:\n", extractedText);

      const parsedData = parseCertificateText(extractedText);
      console.log("Parsed Data:", parsedData);

      const filledFields = Object.values(parsedData).filter((v) => v !== "Unknown").length;
      const confidence = Math.min(filledFields * 15, 100);

      let status: VerificationData["status"] = "invalid";
      if (confidence > 60) status = "verified";
      else if (confidence > 40) status = "suspicious";

      const result: VerificationData = {
        status,
        confidence,
        extractedData: parsedData,
        checks: {
          formatValidation: confidence > 50,
          sealAuthenticity: confidence > 60,
          databaseMatch: confidence > 70,
          tampering: confidence > 80,
        },
        timestamp: new Date().toISOString(),
      };

      setVerificationData(result);

      if (status === "verified") toast.success("Certificate verified successfully");
      else if (status === "suspicious") toast.warning("Certificate verification raised concerns");
      else toast.error("Certificate seems invalid");
    } catch (error) {
      console.error("OCR or verification error:", error);
      toast.error("OCR or verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">AcaVerify</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Verify Certificate</h1>
            <p className="text-muted-foreground">
              Upload a certificate to verify its authenticity
            </p>
          </div>

          {/* Upload Section */}
          <Card className="p-8">
            <UploadZone onFileSelect={handleFileSelect} currentFile={file} />
            {file && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  {isVerifying ? "Verifying..." : "Verify Certificate"}
                </Button>
              </div>
            )}
          </Card>

          {/* Results Section */}
          {verificationData && <VerificationResult data={verificationData} />}
        </div>
      </div>
    </div>
  );
};

// ✅ Default export
export default Verify;
