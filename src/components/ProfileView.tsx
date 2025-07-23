import { User, Settings, LogOut, Bell, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileViewProps {
  onOpenSettings: () => void;
}

export const ProfileView = ({ onOpenSettings }: ProfileViewProps) => {
  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <User className="text-primary" size={24} />
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>

        {/* User Info Card */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                JS
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">John Student</h2>
              <p className="text-sm text-muted-foreground">Class 10A</p>
              <p className="text-xs text-muted-foreground">Student ID: 2024001</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">School:</span>
              <p className="font-medium">Max Planck Gymnasium</p>
            </div>
            <div>
              <span className="text-muted-foreground">Year:</span>
              <p className="font-medium">2024/2025</p>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} className="text-primary" />
            <h3 className="font-semibold">Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-muted-foreground" />
                <div>
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about schedule changes
                  </p>
                </div>
              </div>
              <Switch id="notifications" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette size={16} className="text-muted-foreground" />
                <div>
                  <Label htmlFor="colors" className="text-sm font-medium">
                    Subject Colors
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Use color coding for subjects
                  </p>
                </div>
              </div>
              <Switch id="colors" defaultChecked />
            </div>
          </div>
        </Card>

        {/* Subject Colors Preview */}
        <Card className="p-6 mb-4">
          <h3 className="font-semibold mb-4">Subject Colors</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { subject: "Math", color: "subject-math" },
              { subject: "German", color: "subject-german" },
              { subject: "English", color: "subject-english" },
              { subject: "History", color: "subject-history" },
              { subject: "Biology", color: "subject-biology" },
              { subject: "Chemistry", color: "subject-chemistry" }
            ].map(({ subject, color }) => (
              <div key={subject} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: `hsl(var(--${color}))` }}
                />
                <span>{subject}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={onOpenSettings}>
            <Settings className="mr-2 h-4 w-4" />
            App Settings
          </Button>
          
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};