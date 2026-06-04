import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APPLICATION_STAGE } from "@/shared/constants/enums";

const stageConfig = {
    // General / Legacy
    [APPLICATION_STAGE.interview]: { label: "Active Interview", color: "bg-indigo-100 text-indigo-700 border-indigo-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.shorListed]: { label: "Shortlisted", color: "bg-purple-100 text-purple-700 border-purple-200" },
    [APPLICATION_STAGE.hired]: { label: "Hired / Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    [APPLICATION_STAGE.rejected]: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },

    // Pipeline Stages
    [APPLICATION_STAGE.cv_screening]: { label: "CV Screening", color: "bg-slate-100 text-slate-700 border-slate-200" },
    [APPLICATION_STAGE.ai_screening]: { label: "AI Screening", color: "bg-purple-100 text-purple-700 border-purple-200" },
    [APPLICATION_STAGE.assessment_test]: { label: "Assessment Test", color: "bg-indigo-100 text-indigo-700 border-indigo-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.coding_test]: { label: "Coding Test", color: "bg-blue-100 text-blue-700 border-blue-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.video_interview]: { label: "Video Interview", color: "bg-cyan-100 text-cyan-700 border-cyan-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.technical_interview]: { label: "Technical Interview", color: "bg-indigo-100 text-indigo-700 border-indigo-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.hr_interview]: { label: "HR Interview", color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.manager_interview]: { label: "Manager Interview", color: "bg-violet-100 text-violet-700 border-violet-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.background_check]: { label: "Background Check", color: "bg-orange-100 text-orange-700 border-orange-200" },
    [APPLICATION_STAGE.offer]: { label: "Offer", color: "bg-green-100 text-green-700 border-green-200" },
};

const INTERVIEW_STAGE_TYPES = [
    APPLICATION_STAGE.assessment_test,
    APPLICATION_STAGE.coding_test,
    APPLICATION_STAGE.video_interview,
    APPLICATION_STAGE.technical_interview,
    APPLICATION_STAGE.hr_interview,
    APPLICATION_STAGE.manager_interview,
    APPLICATION_STAGE.ai_screening,
];

function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

export default function InterviewList({ applications }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all_interviews");

    // Helper to find an active interview stage
    const getActiveInterviewStage = (app) => {
        if (!app.application_stages || !Array.isArray(app.application_stages)) return null;
        
        const sortedStages = [...app.application_stages].sort((a, b) => {
            const orderA = a.recruitment_stages?.order_index || 0;
            const orderB = b.recruitment_stages?.order_index || 0;
            return orderA - orderB;
        });

        // in_progress takes precedence
        let active = sortedStages.find(s => s.status === "in_progress" && INTERVIEW_STAGE_TYPES.includes(s.recruitment_stages?.stage_type));
        
        // Otherwise, first pending
        if (!active) {
            active = sortedStages.find(s => s.status === "pending" && INTERVIEW_STAGE_TYPES.includes(s.recruitment_stages?.stage_type));
        }
        
        return active;
    };

    const interviewProcesses = applications?.filter((app) => {
        const activeStage = getActiveInterviewStage(app);
        return activeStage ||
            app.current_stage === APPLICATION_STAGE.interview ||
            app.current_stage === APPLICATION_STAGE.shortlisted ||
            app.current_stage === APPLICATION_STAGE.hired ||
            app.current_stage === APPLICATION_STAGE.rejected;
    }) || [];

    if (interviewProcesses.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
                <h2 className="font-semibold text-gray-800 text-lg">Status Management</h2>
                <p className="text-sm text-gray-400 mt-1">No interview processes or status updates records found yet.</p>
            </div>
        );
    }

    const countAll = interviewProcesses.length;
    const countInterviews = interviewProcesses.filter(app => getActiveInterviewStage(app) || app.current_stage === APPLICATION_STAGE.interview).length;
    const countCompleted = interviewProcesses.filter(app => !getActiveInterviewStage(app) && app.current_stage === APPLICATION_STAGE.hired).length;
    const countRejected = interviewProcesses.filter(app => !getActiveInterviewStage(app) && app.current_stage === APPLICATION_STAGE.rejected).length;

    const filteredInterviews = interviewProcesses.filter((app) => {
        const activeStage = getActiveInterviewStage(app);
        if (activeTab === "all_interviews") return true;
        if (activeTab === "interview") return activeStage || app.current_stage === APPLICATION_STAGE.interview;
        if (activeTab === "completed") return !activeStage && app.current_stage === APPLICATION_STAGE.hired;
        if (activeTab === "rejected") return !activeStage && app.current_stage === APPLICATION_STAGE.rejected;
        return true;
    });

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div>
                <h2 className="font-semibold text-gray-800 text-lg">Status Management</h2>
                <p className="text-sm text-gray-500 mt-0.5">Track your interview stages and process results</p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                <button
                    onClick={() => setActiveTab("all_interviews")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "all_interviews" ? "bg-slate-900 text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                >
                    All Processes - {countAll}
                </button>
                <button
                    onClick={() => setActiveTab("interview")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "interview" ? "bg-indigo-600 text-white shadow-sm" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                >
                    Active Interviews - {countInterviews}
                </button>
                <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "completed" ? "bg-green-600 text-white shadow-sm" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                >
                    Completed - {countCompleted}
                </button>
                <button
                    onClick={() => setActiveTab("rejected")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "rejected" ? "bg-red-600 text-white shadow-sm" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                >
                    Rejected - {countRejected}
                </button>
            </div>

            <div className="space-y-4">
                {filteredInterviews.length === 0 ? (
                    <p className="text-sm text-gray-400 py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No records found in this section.
                    </p>
                ) : (
                    filteredInterviews.map((app) => {
                        const job = app.job_postings;
                        const company = job?.companies;
                        const activeStage = getActiveInterviewStage(app);
                        const isInterviewActive = !!activeStage || app.current_stage === APPLICATION_STAGE.interview;
                        
                        let displayLabel = app.current_stage;
                        let displayColor = stageConfig[app.current_stage]?.color || "bg-gray-100 text-gray-700";

                        if (activeStage) {
                            const type = activeStage.recruitment_stages?.stage_type;
                            displayLabel = activeStage.recruitment_stages?.name || "Interview Stage";
                            displayColor = stageConfig[type]?.color || stageConfig[APPLICATION_STAGE.interview].color;
                        } else if (stageConfig[app.current_stage]) {
                            displayLabel = stageConfig[app.current_stage].label;
                        }

                        return (
                            <div
                                key={app.id}
                                className="bg-gray-50/60 border border-gray-100 rounded-xl p-5 shadow-xs hover:shadow-sm hover:border-violet-200 hover:bg-white transition-all duration-200 flex items-center justify-between flex-wrap gap-4"
                            >
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-semibold text-gray-800 text-base tracking-tight">
                                            {job?.title || "Unknown Position"}
                                        </h4>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${displayColor}`}>
                                            {displayLabel}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 font-medium">
                                        {company?.name || "Unknown Company"}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="bg-gray-200/70 px-2 py-0.5 rounded text-[11px] font-mono text-gray-500">
                                            ID: {app.candidate_profile_id.substring(0, 8)}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span>Applied {formatDate(app.applied_at)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {isInterviewActive && (
                                        <button
                                            onClick={() => navigate(`/interview/${app.id}`)}
                                            className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs hover:bg-indigo-700 transition-all"
                                        >
                                            {activeStage ? `Start ${activeStage.recruitment_stages?.name}` : "Start AI Interview"}
                                        </button>
                                    )}
                                    {app.cv_file_url && (
                                        <a
                                            href={app.cv_file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-violet-600 text-xs font-semibold bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-xs hover:border-violet-300 hover:bg-violet-50/50 transition-all"
                                        >
                                            View Submitted CV
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}