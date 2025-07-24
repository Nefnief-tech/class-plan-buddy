import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from 'react-markdown';
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
  apiKey?: string;
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
  const [selectedDay, setSelectedDay] = useState<number>(0);


  // Cache key for localStorage
  const CACHE_KEY = "elternportal-substitutes";
  const CACHE_TTL = 1000 * 60 * 60; // 1 hour

  useEffect(() => {
    const savedConfig = localStorage.getItem('elternportal-config');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);

      // Try to load from cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setSubstitutes(data);
            return;
          }
        } catch {}
      }
      // If no valid cache, fetch
      fetchSubstitutes(parsedConfig);
    }
  }, []);

  const fetchSubstitutes = async (configToUse?: SetupConfig, { skipCacheWrite = false } = {}) => {
    const activeConfig = configToUse || config;
    if (!activeConfig) return;

    setIsLoading(true);
    setHasError(false);

  try {
      const requestBody: Record<string, any> = {
        username: activeConfig.username,
        password: activeConfig.password,
        baseUrl: activeConfig.baseUrl,
        vertretungsplanUrl: activeConfig.vertretungsplanUrl
      };
      if (activeConfig.apiKey) {
        requestBody.apiKey = activeConfig.apiKey;
      }
      const response = await fetch('https://test-api-pwwbj5-10d814-150-230-144-172.traefik.me/api/vertretungsplan/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.success) {
        setSubstitutes(result.fields || []);
        if (!skipCacheWrite) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: result.fields || [],
            timestamp: Date.now()
          }));
        }
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
      // Always refetch and update cache
      fetchSubstitutes(undefined, { skipCacheWrite: false });
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
        {/* Day selector */}
        {substitutes.length > 0 && (
          <div className="flex gap-2 mt-2 mb-1">
            {substitutes.map((substitute: SubstituteEntry, idx: number) => (
              <Button
                key={substitute.name}
                size="sm"
                variant={selectedDay === idx ? "default" : "outline"}
                className="text-xs px-3"
                onClick={() => setSelectedDay(idx)}
              >
                {substitute.name}
              </Button>
            ))}
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {substitutes.length > 0 && substitutes[selectedDay]?.name}
        </p>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {isLoading ? (
          // Skeleton loader for fetching
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="w-full p-5">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-5 rounded-full bg-orange-300 dark:bg-orange-700" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))
        ) : hasError ? (
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
        ) : substitutes.length > 1 ? (
          <>
             {/* Group and render by day, not by hour */}
             {substitutes
               .filter((substitute, idx) => {
                 if (idx === 0) return false;
                 // Only filter by dayIndex if it exists
                 if ('dayIndex' in substitute && typeof substitute['dayIndex'] === 'number') {
                   return substitute['dayIndex'] === selectedDay;
                 }
                 // If no dayIndex, show all for selected day
                 return true;
               })
               .map((substitute, index) => {
                 const value = substitute.value || "";
                 // Extract fields using regex
                 const subjectMatch = value.match(/\*\*Fach:\*\*\s*(.*?)\s*\*\*/);
                 const roomMatch = value.match(/\*\*Raum:\*\*\s*(.*?)\s*\*\*/);
                 const teacherMatch = value.match(/\*\*Lehrer:\*\*\s*(.*?)\s*\*\*/);
                 const infoMatch = value.match(/\*\*Info:\*\*\s*(.*)/);

                 // For subject, handle strikethrough (~~text~~)
                 let subject = subjectMatch ? subjectMatch[1] : "";
                 let removedSubject = "";
                 const strikeMatch = subject.match(/~~(.*?)~~/);
                 if (strikeMatch) {
                   removedSubject = strikeMatch[1];
                   subject = subject.replace(/~~.*?~~/, "").trim();
                 }
                 const room = roomMatch ? roomMatch[1] : "";
                 const teacher = teacherMatch ? teacherMatch[1] : "";
                 const info = infoMatch ? infoMatch[1] : "";

                 return (
                   <Card
                     key={index}
                     className="w-full p-0 border-l-4 border-l-orange-500 bg-white dark:bg-zinc-900 shadow-sm transition-colors rounded-xl"
                   >
                     <div className="grid grid-cols-5 items-center text-sm px-5 py-3 border-b border-border">
                       <div className="font-medium text-muted-foreground col-span-1">
                         <span className="block text-xs text-muted-foreground">Stunde</span>
                         {substitute.name}
                       </div>
                       <div className="col-span-1">
                         <span className="block text-xs text-muted-foreground">Vertretung</span>
                         {removedSubject && (
                           <span className="line-through text-muted-foreground mr-1">{removedSubject}</span>
                         )}
                         <span className="font-semibold text-foreground">{subject}</span>
                       </div>
                       <div className="col-span-1">
                         <span className="block text-xs text-muted-foreground">Fach</span>
                         <span className="text-foreground">{room}</span>
                       </div>
                       <div className="col-span-1">
                         <span className="block text-xs text-muted-foreground">Raum</span>
                         <span className="text-foreground">{teacher}</span>
                       </div>
                       <div className="col-span-1">
                         <span className="block text-xs text-muted-foreground">Info</span>
                         <span className="text-foreground">{info}</span>
                       </div>
                     </div>
                   </Card>
                 );
               })}
          </>
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