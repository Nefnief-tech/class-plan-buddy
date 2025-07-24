import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Convert Sunday (0) to Monday-Friday (0-4) mapping
    return dayOfWeek === 0 ? 0 : dayOfWeek - 1;
  });
  const { toast } = useToast();


  // Cache key for localStorage
  const CACHE_KEY = "elternportal-timetable";
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
            setTimetableData(data);
            return;
          }
        } catch {}
      }
      // If no valid cache, fetch
      fetchTimetable(parsedConfig);
    }
  }, []);

  const fetchTimetable = async (configToUse?: SetupConfig, { skipCacheWrite = false } = {}) => {
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
        if (!skipCacheWrite) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: result.data,
            timestamp: Date.now()
          }));
        }
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
      // Always refetch and update cache
      fetchTimetable(undefined, { skipCacheWrite: false });
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
    if (isLoading) {
      // Skeleton loader for fetching
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      );
    }
    if (!timetableData?.days || !timetableData?.grid) {
      return (
        <Card className="p-8 text-center">
          <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="font-semibold mb-2">No timetable data</h3>
          <p className="text-sm text-muted-foreground">Could not load your schedule</p>
        </Card>
      );
    }

    // Use selectedDay for the day index
    const dayIndex = selectedDay;
    const daySchedule = dayIndex >= 0 && dayIndex < timetableData.grid[0]?.length 
      ? timetableData.grid.map((period: any, periodIndex: number) => ({
          period: timetableData.periods[periodIndex],
          lesson: period[dayIndex]
        })).filter((item: any) => item.lesson && item.lesson.content)
      : [];

    if (daySchedule.length === 0) {
      return (
        <Card className="p-8 text-center">
          <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="font-semibold mb-2">No classes this day</h3>
          <p className="text-sm text-muted-foreground">Enjoy your free day!</p>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {daySchedule.map((item: any, index: number) => {
          // Try to extract subject, teacher, room from lesson object or content string
          const subject = item.lesson.subject || item.lesson.content?.split('\n')[0] || "";
          const room = item.lesson.room || (item.lesson.content?.split('\n')[1] || "");
          // Optionally extract teacher if available in lesson object or content
          const teacher = item.lesson.teacher || "";
          // If you have start/end time info, you can extract it here, else leave blank
          return (
            <TimetableCard
              key={index}
              entry={{
                id: `${index}`,
                subject,
                teacher,
                room,
                startTime: "",
                endTime: ""
              }}
            />
          );
        })}
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
        {/* Day selector */}
        {timetableData?.days && (
          <div className="flex gap-2 mt-2 mb-1">
            {timetableData.days.map((day: string, idx: number) => (
              <Button
                key={day}
                size="sm"
                variant={selectedDay === idx ? "default" : "outline"}
                className="text-xs px-3"
                onClick={() => setSelectedDay(idx)}
              >
                {day}
              </Button>
            ))}
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {timetableData?.days && timetableData.days[selectedDay]}
        </p>
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