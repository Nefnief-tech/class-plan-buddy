import { Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TimetableEntry {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  type?: "lesson" | "break" | "lunch";
}

interface TimetableCardProps {
  entry: TimetableEntry;
  isActive?: boolean;
}

const subjectColorMap: Record<string, string> = {
  "Mathematics": "subject-math",
  "Math": "subject-math",
  "German": "subject-german",
  "English": "subject-english",
  "History": "subject-history",
  "Biology": "subject-biology",
  "Chemistry": "subject-chemistry",
  "Physics": "subject-physics",
  "Art": "subject-art",
  "Music": "subject-music",
  "Sport": "subject-sport",
  "PE": "subject-sport",
};

const getSubjectColor = (subject: string): string => {
  const colorKey = Object.keys(subjectColorMap).find(key => 
    subject.toLowerCase().includes(key.toLowerCase())
  );
  return colorKey ? subjectColorMap[colorKey] : "subject-default";
};

export const TimetableCard = ({ entry, isActive = false }: TimetableCardProps) => {
  const subjectColor = getSubjectColor(entry.subject);
  
  if (entry.type === "break" || entry.type === "lunch") {
    return (
      <Card className="p-4 mb-3 bg-muted/50 border-dashed">
        <div className="flex items-center justify-center">
          <span className="text-sm text-muted-foreground font-medium">
            {entry.type === "lunch" ? "Lunch Break" : "Break"}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {entry.startTime} - {entry.endTime}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "p-4 mb-3 transition-all duration-300 hover:shadow-[var(--shadow-floating)]",
        "bg-gradient-to-r from-schedule-card to-schedule-card/95",
        isActive && "ring-2 ring-time-indicator shadow-[var(--shadow-floating)]"
      )}
      style={{
        borderLeft: `4px solid hsl(var(--${subjectColor}))`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 
              className="font-semibold text-base"
              style={{ color: `hsl(var(--${subjectColor}))` }}
            >
              {entry.subject}
            </h3>
            {isActive && (
              <div className="w-2 h-2 bg-time-indicator rounded-full animate-pulse" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">{entry.teacher}</p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{entry.startTime} - {entry.endTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>{entry.room}</span>
            </div>
          </div>
        </div>
        
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm"
          style={{ backgroundColor: `hsl(var(--${subjectColor}))` }}
        >
          {entry.subject.substring(0, 2).toUpperCase()}
        </div>
      </div>
    </Card>
  );
};