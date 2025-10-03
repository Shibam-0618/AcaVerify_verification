import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Shield } from "lucide-react";

interface VerificationResultProps {
  data: {
    status: 'verified' | 'suspicious' | 'invalid';
    confidence: number;
    extractedData: {
      studentName: string;
      rollNumber: string;
      course: string;
      institution: string;
      year: string;
      grade: string;
      certificateNumber: string;
    };
    checks: {
      formatValidation: boolean;
      sealAuthenticity: boolean;
      databaseMatch: boolean;
      tampering: boolean;
    };
    timestamp: string;
  };
}

const VerificationResult = ({ data }: VerificationResultProps) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'verified':
        return <CheckCircle className="h-8 w-8 text-success" />;
      case 'suspicious':
        return <AlertTriangle className="h-8 w-8 text-warning" />;
      case 'invalid':
        return <XCircle className="h-8 w-8 text-destructive" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'verified':
        return 'bg-success/10 text-success border-success/20';
      case 'suspicious':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'invalid':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Status Header */}
      <Card className={`p-6 border-2 ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div>
              <h3 className="text-xl font-bold capitalize">{data.status}</h3>
              <p className="text-sm opacity-80">Confidence: {data.confidence}%</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {new Date(data.timestamp).toLocaleString()}
          </Badge>
        </div>
      </Card>

      {/* Extracted Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Extracted Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Student Name</p>
            <p className="font-medium text-foreground">{data.extractedData.studentName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Roll Number</p>
            <p className="font-medium text-foreground">{data.extractedData.rollNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Course</p>
            <p className="font-medium text-foreground">{data.extractedData.course}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Institution</p>
            <p className="font-medium text-foreground">{data.extractedData.institution}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Year</p>
            <p className="font-medium text-foreground">{data.extractedData.year}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Grade</p>
            <p className="font-medium text-foreground">{data.extractedData.grade}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">Certificate Number</p>
            <p className="font-medium text-foreground">{data.extractedData.certificateNumber}</p>
          </div>
        </div>
      </Card>

      {/* Verification Checks */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Verification Checks</h3>
        <div className="space-y-3">
          {Object.entries(data.checks).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-sm font-medium text-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              {value ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default VerificationResult;
