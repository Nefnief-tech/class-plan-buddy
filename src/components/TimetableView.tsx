import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TimetableCard } from "./TimetableCard";

interface TimetableEntry {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  day: string;
  type?: "lesson" | "break" | "lunch";
}

// Mock data - will be replaced with API calls
const mockTimetable: TimetableEntry[] = [
  {
    id: "1",
    subject: "Mathematics",
    teacher: "Mr. Schmidt",
    room: "A101",
    startTime: "08:00",
    endTime: "08:45",
    day: "Monday"
  },
  {
    id: "2",
    subject: "German",
    teacher: "Ms. Mueller",
    room: "B203",
    startTime: "08:50",
    endTime: "09:35",
    day: "Monday"
  },
  {
    id: "break1",
    subject: "Break",
    teacher: "",
    room: "",
    startTime: "09:35",
    endTime: "09:50",
    day: "Monday",
    type: "break"
  },
  {
    id: "3",
    subject: "English",
    teacher: "Mr. Johnson",
    room: "C105",
    startTime: "09:50",
    endTime: "10:35",
    day: "Monday"
  },
  {
    id: "4",
    subject: "Biology",
    teacher: "Dr. Weber",
    room: "Lab 1",
    startTime: "10:40",
    endTime: "11:25",
    day: "Monday"
  },
  {
    id: "lunch",
    subject: "Lunch",
    teacher: "",
    room: "",
    startTime: "11:25",
    endTime: "12:10",
    day: "Monday",
    type: "lunch"
  },
  {
    id: "5",
    subject: "History",
    teacher: "Mr. Wagner",
    room: "A205",
    startTime: "12:10",
    endTime: "12:55",
    day: "Monday"
  },
  {
    id: "6",
    subject: "Physics",
    teacher: "Dr. Schneider",
    room: "Lab 2",
    startTime: "13:00",
    endTime: "13:45",
    day: "Monday"
  }
];

export const TimetableView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isCurrentLesson = (startTime: string, endTime: string): boolean => {
    const now = currentTime;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startDate = new Date(now);
    startDate.setHours(startHour, startMin, 0, 0);
    
    const endDate = new Date(now);
    endDate.setHours(endHour, endMin, 0, 0);
    
    return now >= startDate && now <= endDate;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const todayEntries = mockTimetable.filter(entry => {
    // For now, showing Monday's schedule. In real app, filter by actual day
    return entry.day === "Monday";
  });

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="text-primary" size={24} />
            <h1 className="text-xl font-bold text-foreground">Timetable</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft size={16} />
            </Button>
            
            <div className="text-center">
              <h2 className="font-semibold text-base">{formatDate(currentDate)}</h2>
              <p className="text-xs text-muted-foreground">{todayEntries.length} lessons today</p>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </Card>
      </div>

      {/* Timetable Entries */}
      <div className="p-4">
        {todayEntries.length > 0 ? (
          <div className="space-y-2">
            {todayEntries.map((entry) => (
              <TimetableCard
                key={entry.id}
                entry={entry}
                isActive={isCurrentLesson(entry.startTime, entry.endTime)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="font-semibold mb-2">No lessons today</h3>
            <p className="text-sm text-muted-foreground">Enjoy your free day!</p>
          </Card>
        )}
      </div>
    </div>
  );
};