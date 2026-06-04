import { APPLICATION_STAGE } from "@/shared/constants/enums";

const stageConfig = {
  // General / Legacy
  [APPLICATION_STAGE.applied]: { label: "Applied", color: "bg-blue-100 text-blue-700" },
  [APPLICATION_STAGE.screening]: { label: "Screening", color: "bg-yellow-100 text-yellow-700" },
  [APPLICATION_STAGE.shorListed]: { label: "Shortlisted", color: "bg-purple-100 text-purple-700" },
  [APPLICATION_STAGE.interview]: { label: "Interview", color: "bg-indigo-100 text-indigo-700" },
  [APPLICATION_STAGE.hired]: { label: "Hired", color: "bg-emerald-100 text-emerald-700" },
  [APPLICATION_STAGE.rejected]: { label: "Rejected", color: "bg-red-100 text-red-700" },
  
  // Pipeline Stages
  [APPLICATION_STAGE.cv_screening]: { label: "CV Screening", color: "bg-slate-100 text-slate-700" },
  [APPLICATION_STAGE.ai_screening]: { label: "AI Screening", color: "bg-purple-100 text-purple-700" },
  [APPLICATION_STAGE.assessment_test]: { label: "Assessment Test", color: "bg-indigo-100 text-indigo-700" },
  [APPLICATION_STAGE.coding_test]: { label: "Coding Test", color: "bg-blue-100 text-blue-700" },
  [APPLICATION_STAGE.video_interview]: { label: "Video Interview", color: "bg-cyan-100 text-cyan-700" },
  [APPLICATION_STAGE.technical_interview]: { label: "Technical Interview", color: "bg-indigo-100 text-indigo-700" },
  [APPLICATION_STAGE.hr_interview]: { label: "HR Interview", color: "bg-fuchsia-100 text-fuchsia-700" },
  [APPLICATION_STAGE.manager_interview]: { label: "Manager Interview", color: "bg-violet-100 text-violet-700" },
  [APPLICATION_STAGE.background_check]: { label: "Background Check", color: "bg-orange-100 text-orange-700" },
  [APPLICATION_STAGE.offer]: { label: "Offer", color: "bg-green-100 text-green-700" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ApplicationsList({ applications }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-800 text-lg mb-2">
          Active applications
        </h2>
        <p className="text-sm text-gray-400">No applications yet.</p>
      </div>
    );
  }

  // Helper to find an active stage
  const getActiveStage = (app) => {
    if (!app.application_stages || !Array.isArray(app.application_stages)) return null;
    
    // Sort stages by order_index to evaluate them in the correct pipeline sequence
    const sortedStages = [...app.application_stages].sort((a, b) => {
      const orderA = a.recruitment_stages?.order_index || 0;
      const orderB = b.recruitment_stages?.order_index || 0;
      return orderA - orderB;
    });

    // An in_progress stage always takes precedence
    const inProgressStage = sortedStages.find(s => s.status === "in_progress");
    if (inProgressStage) return inProgressStage;

    // Otherwise, the current stage is the first one that is pending
    return sortedStages.find(s => s.status === "pending");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 text-lg">
          Active applications
        </h2>
        <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
          View all &gt;
        </button>
      </div>

      {applications.map((app) => {
        const job = app.job_postings;
        const company = job?.companies;
        const activeStage = getActiveStage(app);

        let displayLabel = app.current_stage;
        let displayColor = stageConfig[app.current_stage]?.color || "bg-gray-100 text-gray-700";

        if (activeStage) {
          const type = activeStage.recruitment_stages?.stage_type;
          displayLabel = activeStage.recruitment_stages?.name || "Processing";
          displayColor = stageConfig[type]?.color || stageConfig[APPLICATION_STAGE.interview].color; 
        } else if (stageConfig[app.current_stage]) {
          displayLabel = stageConfig[app.current_stage].label;
        }

        return (
          <div
            key={app.id}
            className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-gray-800 truncate">
                    {job?.title || "Unknown Position"}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${displayColor}`}>
                    {displayLabel}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {company?.name || "Unknown Company"}
                </p>
                <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                  <span>Applied {formatDate(app.applied_at)}</span>
                  {job?.closed_at && (
                    <span>Closes {formatDate(job.closed_at)}</span>
                  )}
                </div>
              </div>
              <button className="text-violet-600 text-sm font-medium border border-violet-200 px-3 py-1 rounded-full hover:bg-violet-50 transition-colors shrink-0">
                Open &gt;
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
