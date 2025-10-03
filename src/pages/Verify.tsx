import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Upload, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import UploadZone from "@/components/UploadZone";
import VerificationResult from "@/components/VerificationResult";

const Verify = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please login to verify certificates");
        navigate('/auth');
      }
    });
  }, [navigate]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setVerificationData(null);
  };

  const handleVerify = async () => {
    if (!file) {
      toast.error("Please upload a certificate first");
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate verification process with AI-powered analysis
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock verification result
      const mockResult = {
        status: Math.random() > 0.3 ? 'verified' : 'suspicious',
        confidence: Math.floor(Math.random() * 30) + 70,
        extractedData: {
          studentName: "Rahul Kumar",
          rollNumber: "JH2021CS1234",
          course: "B.Tech Computer Science",
          institution: "Birsa Institute of Technology",
          year: "2021-2025",
          grade: "A",
          certificateNumber: "BIT/2025/CS/1234"
        },
        checks: {
          formatValidation: Math.random() > 0.2,
          sealAuthenticity: Math.random() > 0.3,
          databaseMatch: Math.random() > 0.4,
          tampering: Math.random() < 0.7
        },
        timestamp: new Date().toISOString()
      };

      setVerificationData(mockResult);
      
      if (mockResult.status === 'verified') {
        toast.success("Certificate verified successfully");
      } else {
        toast.warning("Certificate verification raised concerns");
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
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
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">CertiVerify</span>
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
          {verificationData && (
            <VerificationResult data={verificationData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;
