import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Settings, RefreshCw, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TimetableCard } from "./TimetableCard";

interface SetupConfig {
  username: string;
  password: string;
  baseUrl: string;
  vertretungsplanUrl: string;
  timetableUrl: string;
}

interface TimetableViewProps {
  onOpenSettings: () => void;
}

export const TimetableView = ({ onOpenSettings }: TimetableViewProps) => {
  const [config, setConfig] = useState<SetupConfig | null>(null);
  const [timetableData, setTimetableData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedConfig = localStorage.getItem('elternportal-config');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      fetchTimetable(parsedConfig);
    }
  }, []);

  const fetchTimetable = async (configToUse?: SetupConfig) => {
    const activeConfig = configToUse || config;
    if (!activeConfig) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch('https://test-api-pwwbj5-10d814-150-230-144-172.traefik.me/api/plan/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeConfig)
      });

      const result = await response.json();

      if (result.success) {
        setTimetableData(result.data);
        toast({
          title: "Updated successfully",
          description: "Timetable refreshed"
        });
      } else {
        throw new Error(result.message || 'Failed to fetch timetable');
      }
    } catch (error) {
      setHasError(true);
      toast({
        title: "Update failed",
        description: "Could not fetch timetable",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTimetable = () => {
    if (config) {
      fetchTimetable();
    }
  };

  if (!config) {
    return (
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-primary" size={24} />
            <h1 className="text-xl font-bold text-foreground">Timetable</h1>
          </div>

          <Card className="p-6">
            <div className="text-center mb-6">
              <Settings className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="font-semibold mb-2">Setup Required</h3>
              <p className="text-sm text-muted-foreground">
                Configure your eltern-portal connection to view your timetable
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

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const renderTimetableGrid = () => {
    if (!timetableData?.days || !timetableData?.grid) {
      return (
        <Card className="p-8 text-center">
          <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="font-semibold mb-2">No timetable data</h3>
          <p className="text-sm text-muted-foreground">Could not load your schedule</p>
        </Card>
      );
    }

    const getCurrentDayIndex = () => {
      const dayOfWeek = today.getDay();
      // Convert Sunday (0) to Monday-Friday (0-4) mapping
      return dayOfWeek === 0 ? -1 : dayOfWeek - 1;
    };

    const currentDayIndex = getCurrentDayIndex();
    const todaySchedule = currentDayIndex >= 0 && currentDayIndex < timetableData.grid[0]?.length 
      ? timetableData.grid.map((period: any, periodIndex: number) => ({
          period: timetableData.periods[periodIndex],
          lesson: period[currentDayIndex]
        })).filter((item: any) => item.lesson && item.lesson.content)
      : [];

    if (todaySchedule.length === 0) {
      return (
        <Card className="p-8 text-center">
          <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="font-semibold mb-2">No classes today</h3>
          <p className="text-sm text-muted-foreground">Enjoy your free day!</p>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {todaySchedule.map((item: any, index: number) => (
          <Card key={index} className="p-4 border-l-4 border-l-primary">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-primary">Period {item.period}</h3>
            </div>
            <div className="text-sm text-foreground whitespace-pre-line">
              {item.lesson.content}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-primary" size={24} />
            <h1 className="text-xl font-bold text-foreground">Timetable</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onOpenSettings}>
              <Settings size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={refreshTimetable} disabled={isLoading}>
              <RefreshCw className={isLoading ? "animate-spin" : ""} size={16} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{todayStr}</p>
      </div>

      <div className="p-4">
        {hasError ? (
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-destructive" size={48} />
            <h3 className="font-semibold mb-2">Connection Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Could not fetch timetable from your portal
            </p>
            <Button onClick={refreshTimetable} variant="outline">
              Try Again
            </Button>
          </Card>
        ) : (
          renderTimetableGrid()
        )}
      </div>
    </div>
  );
};