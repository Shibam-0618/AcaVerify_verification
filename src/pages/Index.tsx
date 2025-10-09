import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Search, Lock, CheckCircle, AlertTriangle, FileCheck, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">AcaVerify</span>
          </div>
          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <>
                  <Button onClick={() => navigate('/verify')} className="bg-primary hover:bg-primary/90">
                    Verify Certificate
                  </Button>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth')}
                >
                  Login / Sign Up
                </Button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Digital Certificate Verification System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Authenticate educational credentials instantly with our AI-powered platform. 
            Protecting academic integrity across India.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Button 
              onClick={() => navigate('/verify')}
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg"
            >
              <FileCheck className="mr-2 h-5 w-5" />
              Verify Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-success mb-2">99.8%</div>
            <div className="text-sm text-muted-foreground">Accuracy Rate</div>
          </Card>
          <Card className="p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-primary mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Certificates Verified</div>
          </Card>
          <Card className="p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-accent mb-2">150+</div>
            <div className="text-sm text-muted-foreground">Institutions Connected</div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our advanced system uses AI and OCR technology to detect fake certificates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 space-y-4 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Upload & Extract</h3>
            <p className="text-muted-foreground">
              Upload certificate images or PDFs. Our OCR technology extracts key details automatically.
            </p>
          </Card>

          <Card className="p-8 space-y-4 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Verify Authenticity</h3>
            <p className="text-muted-foreground">
              Cross-reference with institutional databases and detect tampering or forgery.
            </p>
          </Card>

          <Card className="p-8 space-y-4 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Secure Results</h3>
            <p className="text-muted-foreground">
              Get instant verification results with detailed analysis and security reports.
            </p>
          </Card>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="container mx-auto px-4 py-20 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-8 w-8 text-warning flex-shrink-0 mt-1" />
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Why Verification Matters</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fake degrees undermine academic integrity and harm legitimate graduates. Our system helps 
                  employers, institutions, and agencies verify credentials instantly, preventing fraud and 
                  maintaining trust in educational qualifications.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span>Detect tampered grades, photos, and seals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span>Verify certificate numbers and institution records</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span>Flag duplicate or cloned documents</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 AcaVerify. A digital initiative for educational integrity in Jharkhand.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
