import { useState, useEffect } from "react";
import { FileText, AlertCircle, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SubstituteEntry {
  name: string;
  value: string;
  inline: boolean;
}

interface SetupConfig {
  username: string;
  password: string;
  baseUrl: string;
  vertretungsplanUrl: string;
  timetableUrl: string;
}

interface SubstituteViewProps {
  onOpenSettings: () => void;
}

export const SubstituteView = ({ onOpenSettings }: SubstituteViewProps) => {
  const [config, setConfig] = useState<SetupConfig | null>(null);
  const [substitutes, setSubstitutes] = useState<SubstituteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedConfig = localStorage.getItem('elternportal-config');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      fetchSubstitutes(parsedConfig);
    }
  }, []);

  const fetchSubstitutes = async (configToUse?: SetupConfig) => {
    const activeConfig = configToUse || config;
    if (!activeConfig) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch('https://test-api-pwwbj5-10d814-150-230-144-172.traefik.me/api/vertretungsplan/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeConfig)
      });

      const result = await response.json();

      if (result.success) {
        setSubstitutes(result.fields || []);
        toast({
          title: "Updated successfully",
          description: "Substitute plan refreshed"
        });
      } else {
        throw new Error(result.message || 'Failed to fetch substitute plan');
      }
    } catch (error) {
      setHasError(true);
      toast({
        title: "Update failed",
        description: "Could not fetch substitute plan",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubstitutes = () => {
    if (config) {
      fetchSubstitutes();
    }
  };

  if (!config) {
    return (
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="text-primary" size={24} />
            <h1 className="text-xl font-bold text-foreground">Substitute Plan</h1>
          </div>

          <Card className="p-6">
            <div className="text-center mb-6">
              <Settings className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="font-semibold mb-2">Setup Required</h3>
              <p className="text-sm text-muted-foreground">
                Configure your eltern-portal connection to view your substitute plan
              </p>
            </div>

            <Button onClick={onOpenSettings} className="w-full">
              Open Settings
            </Button>
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onOpenSettings}>
              <Settings size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={refreshSubstitutes} disabled={isLoading}>
              <RefreshCw className={isLoading ? "animate-spin" : ""} size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {hasError ? (
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-destructive" size={48} />
            <h3 className="font-semibold mb-2">Connection Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Could not fetch substitute plan from your portal
            </p>
            <Button onClick={refreshSubstitutes} variant="outline">
              Try Again
            </Button>
          </Card>
        ) : substitutes.length > 0 ? (
          <div className="space-y-3">
            {substitutes.map((substitute, index) => (
              <Card key={index} className="p-4 border-l-4 border-l-orange-500">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-orange-600">{substitute.name}</h3>
                </div>
                
                <div className="text-sm whitespace-pre-line text-foreground">
                  {substitute.value}
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