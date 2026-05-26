// /pages/applicant/ApplicantPage.jsx
import ApplicantHeader from "../components/ApplicantHeader";
import StatsCards from "../components/StatsCards";
import ApplicationsList from "../components/ApplicationsList";
import RecommendedJobs from "../components/RecommendedJobs";
import ProfileStrength from "../components/ProfileStrength";
import FeedbackTips from "../components/FeedbackTips";
import { useEffect } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { useApplications } from "@/features/applications/context/application.context";

export default function ApplicantPage() {
  const { profile, user } = useUser();
  const { loading, applications, error, getAllApplications } = useApplications();

  useEffect(() => {
    if (user?.id) {
      getAllApplications(user.id);
    }
  }, [user?.id]);

  if (loading){
    return <div>loading applications</div>
  }

  if(error){
    return(<div>{error}</div>)
  }
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 p-6 space-y-6 font-sans">
      <ApplicantHeader {...profile}/>

      <StatsCards applications={applications}/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ApplicationsList applications={applications} />
          <FeedbackTips />
        </div>

        <div className="space-y-6">
          <ProfileStrength />
          <RecommendedJobs />
        </div>
      </div>
    </div>
  );
}
