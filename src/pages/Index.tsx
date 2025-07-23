import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TimetableView } from "@/components/TimetableView";
import { SubstituteView } from "@/components/SubstituteView";
import { ProfileView } from "@/components/ProfileView";
import { SetupView } from "@/components/SetupView";

const Index = () => {
  const [activeTab, setActiveTab] = useState("timetable");
  const [showSetup, setShowSetup] = useState(false);

  const handleSetupComplete = () => {
    setShowSetup(false);
  };

  const openSettings = () => {
    setShowSetup(true);
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
        <SetupView onSetupComplete={handleSetupComplete} />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case "timetable":
        return <TimetableView onOpenSettings={openSettings} />;
      case "substitute":
        return <SubstituteView onOpenSettings={openSettings} />;
      case "profile":
        return <ProfileView onOpenSettings={openSettings} />;
      default:
        return <TimetableView onOpenSettings={openSettings} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {renderActiveView()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
