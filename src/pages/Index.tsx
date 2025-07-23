import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TimetableView } from "@/components/TimetableView";
import { SubstituteView } from "@/components/SubstituteView";
import { ProfileView } from "@/components/ProfileView";

const Index = () => {
  const [activeTab, setActiveTab] = useState("timetable");

  const renderActiveView = () => {
    switch (activeTab) {
      case "timetable":
        return <TimetableView />;
      case "substitute":
        return <SubstituteView />;
      case "profile":
        return <ProfileView />;
      default:
        return <TimetableView />;
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
