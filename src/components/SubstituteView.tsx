import { useState } from "react";
import { FileText, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SubstituteEntry {
  id: string;
  lesson: string;
  originalTeacher: string;
  substituteTeacher: string;
  room: string;
  note: string;
  date: string;
}

// Mock data - will be replaced with API calls
const mockSubstitutes: SubstituteEntry[] = [
  {
    id: "1",
    lesson: "3rd Period - Mathematics",
    originalTeacher: "Mr. Schmidt",
    substituteTeacher: "Ms. Fischer",
    room: "A101 → B205",
    note: "Bring calculator",
    date: "Today"
  },
  {
    id: "2",
    lesson: "5th Period - History",
    originalTeacher: "Mr. Wagner",
    substituteTeacher: "Self-study",
    room: "Library",
    note: "Complete worksheet from last lesson",
    date: "Today"
  }
];

export const SubstituteView = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call - replace with actual Supabase integration
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
      toast({
        title: "Login successful",
        description: "Connected to eltern-portal.org"
      });
    }, 2000);
  };

  const refreshSubstitutes = () => {
    toast({
      title: "Refreshing...",
      description: "Fetching latest substitute plan"
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="text-primary" size={24} />
            <h1 className="text-xl font-bold text-foreground">Substitute Plan</h1>
          </div>

          <Card className="p-6">
            <div className="text-center mb-6">
              <AlertCircle className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="font-semibold mb-2">Connect to eltern-portal.org</h3>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access the substitute plan
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username/Email</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username or email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                />
              </div>

              <Button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect to Portal"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your credentials are securely stored and only used to access your substitute plan
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" size={24} />
            <h1 className="text-xl font-bold text-foreground">Substitute Plan</h1>
          </div>
          <Button variant="outline" size="sm" onClick={refreshSubstitutes}>
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {mockSubstitutes.length > 0 ? (
          <div className="space-y-3">
            {mockSubstitutes.map((substitute) => (
              <Card key={substitute.id} className="p-4 border-l-4 border-l-orange-500">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-orange-600">{substitute.lesson}</h3>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    {substitute.date}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Teacher:</span>
                    <span className="line-through text-muted-foreground">{substitute.originalTeacher}</span>
                    <span>→</span>
                    <span className="font-medium">{substitute.substituteTeacher}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Room:</span>
                    <span>{substitute.room}</span>
                  </div>
                  
                  {substitute.note && (
                    <div className="bg-orange-50 p-2 rounded text-orange-800 text-xs">
                      <strong>Note:</strong> {substitute.note}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="font-semibold mb-2">No substitutions today</h3>
            <p className="text-sm text-muted-foreground">All lessons are running as scheduled</p>
          </Card>
        )}
      </div>
    </div>
  );
};