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
  // English
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
  // German abbreviations
  "Geo": "subject-history", // Geography
  "D": "subject-german",
  "E": "subject-english",
  "M": "subject-math",
  "Ph": "subject-physics",
  "Ch": "subject-chemistry",
  "Bio": "subject-biology",
  "Ku": "subject-art",
  "Mu": "subject-music",
  "Sp": "subject-sport",
  "Eth": "subject-history",
  "Ev": "subject-history",
  "Rel": "subject-history",
  "Inf": "subject-math",
  "Fr": "subject-english",
  "Lat": "subject-english",
  "It": "subject-english",
  "Soz": "subject-history",
  "Wi": "subject-history",
  "NTG": "subject-biology",
  "SG": "subject-sport",
};

const getSubjectColor = (subject: string): string => {
  if (!subject) return "subject-default";
  // Try to match full subject name
  let colorKey = Object.keys(subjectColorMap).find(key =>
    subject.toLowerCase().includes(key.toLowerCase())
  );
  if (colorKey) return subjectColorMap[colorKey];
  // Try to match first word/abbreviation
  const abbr = subject.split(/[^A-Za-zÄÖÜäöüß]+/)[0];
  if (abbr && subjectColorMap[abbr]) return subjectColorMap[abbr];
  return "subject-default";
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
        "flex items-center justify-between gap-4 px-5 py-3 mb-4 rounded-xl border-l-4",
        "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100",
        isActive && "ring-2 ring-time-indicator shadow-[var(--shadow-floating)]"
      )}
      style={{
        borderLeft: `4px solid hsl(var(--${subjectColor}))`
      }}
    >
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-base" style={{ color: `hsl(var(--${subjectColor}))` }}>{entry.subject}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {entry.teacher && <span className="font-medium">{entry.teacher}</span>}
          {entry.room && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {entry.room}
            </span>
          )}
        </div>
      </div>
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0"
        style={{ backgroundColor: `hsl(var(--${subjectColor}))` }}
      >
        {entry.subject.substring(0, 2).toUpperCase()}
      </div>
    </Card>
  );
};