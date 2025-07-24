import { useState } from "react";
import { Settings, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface SetupConfig {
  username: string;
  password: string;
  baseUrl: string;
  vertretungsplanUrl: string;
  timetableUrl: string;
  apiKey?: string;
}

interface SetupViewProps {
  onSetupComplete: (config: SetupConfig) => void;
}

export const SetupView = ({ onSetupComplete }: SetupViewProps) => {
  const [config, setConfig] = useState<SetupConfig>({
    username: "",
    password: "",
    baseUrl: "",
    vertretungsplanUrl: "",
    timetableUrl: "",
    apiKey: ""
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showUrls, setShowUrls] = useState(false);
  const { toast } = useToast();

  // No automatic URL generation; user must enter URLs manually

  const updateConfig = (field: keyof SetupConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async () => {
    if (!config.username || !config.password || !config.baseUrl) {
      toast({
        title: "Incomplete information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    
    try {
      const response = await fetch('https://test-api-pwwbj5-10d814-150-230-144-172.traefik.me/api/test-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: config.username,
          password: config.password,
          baseUrl: config.baseUrl,
          vertretungsplanUrl: config.vertretungsplanUrl,
          timetableUrl: config.timetableUrl
        })
      });

      const result = await response.json();
      setTestResults(result);

      if (result.success) {
        toast({
          title: "Connection successful!",
          description: "All systems are working correctly"
        });
        setCurrentStep(3);
      } else {
        toast({
          title: "Connection failed",
          description: result.message || "Please check your credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Could not connect to the API",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const completeSetup = () => {
    localStorage.setItem('elternportal-config', JSON.stringify(config));
    onSetupComplete(config);
    toast({
      title: "Setup complete!",
      description: "You can now access your timetable and substitute plan"
    });
  };

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {step}
          </div>
          {step < 3 && (
            <ChevronRight className="mx-2 text-muted-foreground" size={16} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card className="p-6">
      <div className="text-center mb-6">
        <Settings className="mx-auto mb-4 text-primary" size={48} />
        <h3 className="font-semibold mb-2">Welcome to Student Portal</h3>
        <p className="text-sm text-muted-foreground">
          Let's set up your connection to your school's eltern-portal
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="username">Username/Email</Label>
          <Input
            id="username"
            type="text"
            value={config.username}
            onChange={(e) => updateConfig('username', e.target.value)}
            placeholder="Your eltern-portal username"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={config.password}
            onChange={(e) => updateConfig('password', e.target.value)}
            placeholder="Your eltern-portal password"
          />
        </div>

        <div>
          <Label htmlFor="baseUrl">School Portal URL</Label>
          <Input
            id="baseUrl"
            type="url"
            value={config.baseUrl}
            onChange={(e) => updateConfig('baseUrl', e.target.value)}
            placeholder="https://your-school.eltern-portal.org/"
          />
          <p className="text-xs text-muted-foreground mt-1">
            The main URL of your school's eltern-portal
          </p>
        </div>

        <div>
          <Label htmlFor="apiKey">API Key (if required)</Label>
          <Input
            id="apiKey"
            type="text"
            value={config.apiKey}
            onChange={(e) => updateConfig('apiKey', e.target.value)}
            placeholder="Your API key (optional)"
          />
        </div>

        <Button 
          onClick={() => setCurrentStep(2)}
          disabled={!config.username || !config.password || !config.baseUrl}
          className="w-full"
        >
          Continue
        </Button>
      </div>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="p-8 rounded-2xl shadow-lg border border-border bg-gradient-to-br from-white via-slate-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-lg">Connection Details</h3>
        <p className="text-sm text-muted-foreground">
          Please enter the full URLs for your substitute and timetable plans below.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="vertretungsplanUrl">Substitute Plan URL</Label>
          <Input
            id="vertretungsplanUrl"
            type="url"
            value={config.vertretungsplanUrl}
            onChange={(e) => updateConfig('vertretungsplanUrl', e.target.value)}
            placeholder="https://your-school.eltern-portal.org/service/vertretungsplan"
          />
        </div>
        <div>
          <Label htmlFor="timetableUrl">Timetable URL</Label>
          <Input
            id="timetableUrl"
            type="url"
            value={config.timetableUrl}
            onChange={(e) => updateConfig('timetableUrl', e.target.value)}
            placeholder="https://your-school.eltern-portal.org/service/stundenplan"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => setCurrentStep(1)}>
            Back
          </Button>
          <Button 
            onClick={testConnection}
            disabled={isTestingConnection}
            className="flex-1 btn-primary"
          >
            {isTestingConnection ? "Testing..." : "Test Connection"}
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="p-6">
      <div className="text-center mb-6">
        <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
        <h3 className="font-semibold mb-2">Connection Successful!</h3>
        <p className="text-sm text-muted-foreground">
          Your portal has been configured successfully
        </p>
      </div>

      {testResults && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="text-green-500" size={16} />
            <span>Login: Successful</span>
          </div>
          {testResults.tests?.vertretungsplan?.success && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="text-green-500" size={16} />
              <span>Substitute Plan: {testResults.tests.vertretungsplan.entriesFound} entries found</span>
            </div>
          )}
          {testResults.tests?.timetable?.success && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="text-green-500" size={16} />
              <span>Timetable: {testResults.tests.timetable.classesFound} classes found</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          Back
        </Button>
        <Button onClick={completeSetup} className="flex-1">
          Complete Setup
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="text-primary" size={24} />
          <h1 className="text-xl font-bold text-foreground">Setup</h1>
        </div>

        {renderStepIndicator()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
};