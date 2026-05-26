// /pages/applicant/ApplicantPage.jsx
import ApplicantHeader from "../../components/applicant/ApplicantHeader";
import StatsCards from "../../components/applicant/StatsCards";
import ApplicationsList from "../../components/applicant/ApplicationsList";
import RecommendedJobs from "../../components/applicant/RecommendedJobs";
import ProfileStrength from "../../components/applicant/ProfileStrength";
import FeedbackTips from "../../components/applicant/FeedbackTips";

export default function ApplicantPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 p-6 space-y-6 font-sans">
      <ApplicantHeader />

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ApplicationsList />
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
