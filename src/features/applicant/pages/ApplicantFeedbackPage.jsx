import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { supabase } from "@/shared/services/supabase";
import { getCandidateProfile, getCandidateStageQuestions, getJobScorePercentile, getPercentileTag } from "@/features/recruiter/services/candidateProfile.service";
import {
  ArrowLeft, FileText, Sparkles, BarChart3, ChevronRight, ChevronDown, Check, X, AlertTriangle, Award,
  Briefcase, Video, Code, ListChecks, MessageSquare, Monitor, Clock, Brain, Loader2
} from "lucide-react";

function getInitials(name = "") {
  return (name || "").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function parseAIFeedback(stage) {
  if (!stage?.ai_feedback) return null;
  try { return JSON.parse(stage.ai_feedback); } catch { return null; }
}

const DimensionBar = ({ label, score }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium text-slate-600 w-36 shrink-0">{label}</span>
    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-yale-blue-600" : score >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${score}%` }} />
    </div>
    <span className="text-sm font-bold text-slate-700 w-8 text-right">{score}</span>
  </div>
);

const QUESTION_TYPE_ICONS = { video: Video, text: FileText, code: Code, multiple_choice: ListChecks };
const QUESTION_TYPE_LABELS = { video: "Video Response", text: "Written Answer", code: "Code Challenge", multiple_choice: "Multiple Choice" };
const STAGE_ICONS = { hr_interview: MessageSquare, technical_interview: Monitor, assessment: Brain, assessment_test: Brain, coding_test: Code, video_interview: Video, manager_interview: MessageSquare, ai_screening: Brain };

function StageSelector({ stages, activeStage, onSelect }) {
  if (stages.length <= 1) return null;
  return (
    <div className="border-b border-cerulean-900">
      <div className="flex -mb-px overflow-x-auto">
        {stages.map(stage => {
          const Icon = STAGE_ICONS[stage.recruitment_stages?.stage_type] || Brain;
          return (
            <button key={stage.id} onClick={() => onSelect(stage)} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeStage?.id === stage.id ? "border-yale-blue-600 text-yale-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}>
              <Icon className="w-4 h-4" />
              {stage.recruitment_stages?.name || "Unknown"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExpandableQuestion({ question, index }) {
  const [expanded, setExpanded] = useState(false);
  const answer = question.application_answers;
  const answerData = Array.isArray(answer) ? answer[0] : answer;
  const context = question.generation_context || {};
  const options = context.options || [];
  const language = context.language || null;
  const Icon = QUESTION_TYPE_ICONS[question.question_type] || FileText;
  const typeLabel = QUESTION_TYPE_LABELS[question.question_type] || question.question_type;

  return (
    <div className="bg-white border border-cerulean-900 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-sky-blue-900/50 transition-colors">
        <div className={`p-2 rounded-lg ${question.question_type === "video" ? "bg-rose-50 text-rose-600" : question.question_type === "code" ? "bg-indigo-50 text-indigo-600" : question.question_type === "multiple_choice" ? "bg-amber-50 text-amber-600" : "bg-sky-blue-900 text-rich-cerulean"}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{typeLabel}</span>
            {language && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">{language}</span>}
            {context.max_time && <span className="flex items-center gap-0.5 text-[10px] text-slate-400"><Clock className="w-3 h-3" />{context.max_time < 60 ? `${context.max_time}s` : `${Math.round(context.max_time / 60)}m`}</span>}
          </div>
          <p className="text-sm font-medium text-slate-800 mt-0.5 line-clamp-2">{question.question_text}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {answerData?.score != null && (
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${answerData.score >= 80 ? "bg-emerald-50 text-emerald-700" : answerData.score >= 60 ? "bg-blue-50 text-blue-700" : answerData.score >= 40 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
              {Math.round(answerData.score)}
            </span>
          )}
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-cerulean-900 px-5 py-4 space-y-4 bg-[#fafcff]">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Answer</h4>
            {question.question_type === "video" && (
              <div className="space-y-3">
                {answerData?.recording_url ? (
                  <video src={answerData.recording_url} controls className="w-full rounded-xl border border-cerulean-900 max-h-[320px] bg-black" />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-400 italic p-3 bg-slate-50 rounded-xl"><Video className="w-4 h-4" />No video recording available</div>
                )}
                {answerData?.transcript && (
                  <div className="bg-white border border-cerulean-900 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2"><MessageSquare className="w-3.5 h-3.5 text-slate-400" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transcript</span></div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{answerData.transcript}</p>
                  </div>
                )}
              </div>
            )}
            {question.question_type === "text" && (
              <div className="bg-white border border-cerulean-900 rounded-xl p-4">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{answerData?.answer_text || "No answer provided."}</p>
              </div>
            )}
            {question.question_type === "code" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {language && <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 uppercase">{language}</span>}
                  {context.code_type && <span className="px-2 py-0.5 rounded text-xs font-bold bg-sky-blue-900 text-rich-cerulean">{context.code_type === "visuals" ? "UI / Visual" : "Problem Solving"}</span>}
                </div>
                {answerData?.answer_text ? (
                  <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre-wrap"><code>{answerData.answer_text}</code></pre>
                ) : (
                  <p className="text-sm text-slate-400 italic p-3 bg-slate-50 rounded-xl">No code submitted.</p>
                )}
              </div>
            )}
            {question.question_type === "multiple_choice" && (
              <div className="space-y-2">
                {options.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Options</span>
                    {options.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isSelected = answerData?.answer_text === opt;
                      return (
                        <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${isSelected ? "bg-yale-blue-50 border-yale-blue-200 text-yale-blue-700 font-medium" : "bg-white border-cerulean-900 text-slate-600"}`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isSelected ? "bg-yale-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>{letter}</span>
                          <span>{opt}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-yale-blue-600" />}
                        </div>
                      );
                    })}
                  </div>
                )}
                {(!answerData?.answer_text || answerData.answer_text === "") && <p className="text-sm text-slate-400 italic p-3 bg-slate-50 rounded-xl">No answer selected.</p>}
              </div>
            )}
          </div>

          {(answerData?.feedback || answerData?.strengths?.length > 0 || answerData?.weaknesses?.length > 0) && (
            <div className="bg-gradient-to-br from-[#f0f9ff] to-[#e6f4ff] rounded-xl border border-blue-100 p-4">
              <div className="flex items-center gap-1.5 mb-3"><Sparkles className="w-3.5 h-3.5 text-yale-blue-600" /><span className="text-[10px] font-bold text-yale-blue-600 uppercase tracking-wider">AI Feedback</span></div>
              {answerData.feedback && <p className="text-sm text-slate-700 leading-relaxed mb-3">{answerData.feedback}</p>}
              {answerData.strengths?.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block mb-1">Strengths</span>
                  <ul className="space-y-1">{answerData.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-green-800"><Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" /><span>{s}</span></li>
                  ))}</ul>
                </div>
              )}
              {answerData.weaknesses?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-1">Weaknesses</span>
                  <ul className="space-y-1">{answerData.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-red-800"><X className="w-3 h-3 text-red-500 mt-0.5 shrink-0" /><span>{w}</span></li>
                  ))}</ul>
                </div>
              )}
            </div>
          )}

          {(!answerData?.feedback && (!answerData?.strengths || answerData.strengths.length === 0) && (!answerData?.weaknesses || answerData.weaknesses.length === 0)) && (
            <p className="text-xs text-slate-400 italic">No AI feedback available for this answer.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApplicantFeedbackPage() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [stagesWithQuestions, setStagesWithQuestions] = useState([]);
  const [activeStage, setActiveStage] = useState(null);
  const [percentile, setPercentile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    supabase
      .from("applications")
      .select(`id, current_stage, is_rejected, applied_at, job_postings ( id, title, companies ( id, name ) )`)
      .eq("candidate_profile_id", user.id)
      .order("applied_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const filtered = data.filter(a => a.current_stage === "rejected" || a.is_rejected === true || a.current_stage === "hired");
          setApplications(filtered);
          const urlAppId = searchParams.get("appId");
          if (urlAppId && filtered.some(a => a.id === urlAppId)) setSelectedId(urlAppId);
          else if (filtered.length > 0) setSelectedId(filtered[0].id);
        }
        setLoading(false);
      });
  }, [user?.id, searchParams]);

  useEffect(() => {
    if (!selectedId) { setSelectedApp(null); setStagesWithQuestions([]); setActiveStage(null); return; }
    getCandidateProfile(selectedId).then(async ({ data }) => {
      setSelectedApp(data);
      if (data?.job_postings?.id && data.composite_score != null && data.composite_score !== 0) {
        getJobScorePercentile(data.job_postings.id, data.composite_score).then(({ percentile: p }) => setPercentile(p));
      }

      const allStages = (data.application_stages || []).filter(s => s.recruitment_stages).sort((a, b) => (a.recruitment_stages.order_index || 0) - (b.recruitment_stages.order_index || 0));
      const interviewStages = allStages.filter(s =>
        ["assessment_test", "coding_test", "video_interview", "technical_interview", "hr_interview", "manager_interview", "ai_screening", "assessment"].includes(s.recruitment_stages?.stage_type)
      );
      if (interviewStages.length === 0) { setStagesWithQuestions([]); setActiveStage(null); return; }

      const stageQuestions = await Promise.all(
        interviewStages.map(async (stage) => {
          const { data: questions } = await getCandidateStageQuestions(stage.id);
          return { ...stage, questions: questions || [] };
        })
      );
      setStagesWithQuestions(stageQuestions);
      setActiveStage(stageQuestions[0]);
    });
  }, [selectedId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-yale-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const app = selectedApp;
  const candidate = app?.profiles || {};
  const selectedJob = app?.job_postings;
  const selectedCompany = selectedJob?.companies;
  const allStages = (app?.application_stages || []).filter(s => s.recruitment_stages).sort((a, b) => (a.recruitment_stages.order_index || 0) - (b.recruitment_stages.order_index || 0));
  const cvStage = allStages.find(s => s.recruitment_stages?.stage_type === "cv_review");
  const cvFeedback = parseAIFeedback(cvStage);
  const scoredStages = allStages.filter(s => s.score != null);
  const computedComposite = scoredStages.length > 0 ? Math.round(scoredStages.reduce((sum, s) => sum + Number(s.score), 0) / scoredStages.length) : (app?.composite_score ?? null);
  const percentileTag = getPercentileTag(percentile);
  const isRejected = app?.current_stage === "rejected" || app?.is_rejected === true;
  const isEmpty = stagesWithQuestions.length === 0 || stagesWithQuestions.every(s => s.questions.length === 0);
  const lastFailed = isRejected ? allStages.filter(s => s.status === "failed" || s.status === "rejected").pop() : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Link to="/applicant" className="inline-flex items-center gap-1.5 text-sm font-semibold text-rich-cerulean hover:text-yale-blue-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-deep-space-blue mb-6">My Feedback</h1>

      {applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-cerulean-900 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><FileText className="w-8 h-8 text-slate-300" /></div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No feedback available yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Feedback and evaluation results will appear here once your applications are reviewed by recruiters or completed through the hiring process.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/applicant" className="px-5 py-2.5 bg-yale-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-yale-blue-700 transition-colors">Back to Dashboard</Link>
            <Link to="/jobs" className="px-5 py-2.5 border border-cerulean-900 text-rich-cerulean rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Explore Jobs</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[280px_1fr] gap-6 items-start">
          {/* Sidebar */}
          <div className="bg-white rounded-2xl border border-cerulean-900 shadow-sm overflow-hidden sticky top-6">
            <div className="px-4 py-3 border-b border-cerulean-900">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isRejected ? "Rejected" : "Offered"} ({applications.length})</span>
            </div>
            {applications.map(app => {
              const job = app.job_postings;
              const company = job?.companies;
              const sel = app.id === selectedId;
              return (
                <button key={app.id} onClick={() => setSelectedId(app.id)} className={`w-full text-left px-4 py-3 border-b border-cerulean-900 transition-colors ${sel ? "bg-yale-blue-50 border-l-2 border-l-yale-blue-600" : "hover:bg-slate-50 border-l-2 border-l-transparent"}`}>
                  <div className="flex items-center gap-2">
                    <Briefcase className={`w-3.5 h-3.5 ${sel ? "text-yale-blue-600" : "text-slate-400"}`} />
                    <span className={`text-sm font-semibold ${sel ? "text-yale-blue-700" : "text-slate-700"}`}>{job?.title || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 ml-5">
                    <span className="text-[11px] text-slate-400">{company?.name}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[11px] text-slate-400">{formatDate(app.applied_at)}</span>
                  </div>
                  <span className={`ml-5 mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${app.current_stage === "hired" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                    {app.current_stage === "hired" ? "Hired" : "Rejected"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div>
            {!app ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-cerulean-900 shadow-sm">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Select an application to view feedback</p>
              </div>
            ) : (
              <>
                {/* Candidate Header */}
                <div className="bg-white rounded-2xl border border-cerulean-900 p-6 shadow-sm mb-6">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yale-blue-600 to-deep-space-blue flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-xl">{getInitials(candidate.full_name || selectedJob?.title)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-deep-space-blue">{candidate.full_name || selectedJob?.title || "Unknown"}</h1>
                        {isRejected && <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-200">Rejected</span>}
                        {!isRejected && app?.current_stage === "hired" && <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Hired</span>}
                      </div>
                      {candidate.headline && <p className="text-sm text-rich-cerulean mt-1">{candidate.headline}</p>}
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 flex-wrap">
                        {app?.answers?.info?.email && <span>{app.answers.info.email}</span>}
                        {app?.answers?.info?.phone && <span>{app.answers.info.phone}</span>}
                        {selectedJob?.title && (
                          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />Applied for: <strong className="text-slate-700">{selectedJob.title}</strong></span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yale-blue-600 to-cerulean flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{computedComposite ?? "--"}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Composite</span>
                      {percentileTag && <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${percentileTag.color}`}>{percentileTag.label}</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: CV Review */}
                  <div className="lg:col-span-2 space-y-6">
                    {cvFeedback ? (
                      <>
                        <div className="rounded-2xl bg-gradient-to-br from-yale-blue-600 via-rich-cerulean to-deep-space-blue p-8 shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-4">
                              <Sparkles className="w-6 h-6 text-sky-blue-800" />
                              <h2 className="text-lg font-bold text-white">AI CV Review</h2>
                              <span className={`ml-auto px-3 py-1 rounded-lg text-xs font-bold ${cvFeedback.recommendation === "proceed" ? "bg-emerald-400 text-emerald-900" : cvFeedback.recommendation === "review" ? "bg-amber-400 text-amber-900" : "bg-red-400 text-red-900"}`}>
                                {cvFeedback.recommendation?.toUpperCase() || "N/A"}
                              </span>
                            </div>
                            <p className="text-sm text-sky-blue-900 leading-relaxed font-medium">{cvFeedback.feedback}</p>
                          </div>
                        </div>
                        {cvFeedback.dimension_scores && (
                          <div className="bg-white rounded-2xl border border-cerulean-900 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-5"><BarChart3 className="w-5 h-5 text-yale-blue-600" /><h2 className="text-lg font-bold text-slate-900">Dimension Scores</h2></div>
                            <div className="space-y-3">{Object.entries(cvFeedback.dimension_scores).map(([key, val]) => <DimensionBar key={key} label={key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} score={val} />)}</div>
                          </div>
                        )}
                        <div className="flex flex-col gap-4">
                          {cvFeedback.strengths?.length > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm">
                              <div className="flex items-center gap-1.5 mb-3"><Check className="w-4 h-4 text-green-600" /><h3 className="text-xs font-bold text-green-700 uppercase tracking-wider">Strengths</h3></div>
                              <ul className="space-y-2">{cvFeedback.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-green-800"><span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" /><span>{s}</span></li>)}</ul>
                            </div>
                          )}
                          {cvFeedback.weaknesses?.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
                              <div className="flex items-center gap-1.5 mb-3"><X className="w-4 h-4 text-red-600" /><h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">Weaknesses</h3></div>
                              <ul className="space-y-2">{cvFeedback.weaknesses.map((w, i) => <li key={i} className="flex items-start gap-2 text-sm text-red-800"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" /><span>{w}</span></li>)}</ul>
                            </div>
                          )}
                          {cvFeedback.gaps?.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                              <div className="flex items-center gap-1.5 mb-3"><AlertTriangle className="w-4 h-4 text-amber-600" /><h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">Gaps</h3></div>
                              <ul className="space-y-2">{cvFeedback.gaps.map((g, i) => <li key={i} className="flex items-start gap-2 text-sm text-amber-800"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" /><span>{g}</span></li>)}</ul>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="bg-white rounded-2xl border border-cerulean-900 p-8 shadow-sm text-center">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No CV review data available</p>
                        <p className="text-xs text-slate-400 mt-1">CV has not been reviewed yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Stage Scores + Assessments */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-cerulean-900 p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4"><Award className="w-4 h-4 text-yale-blue-600" /><h2 className="text-sm font-bold text-slate-900">Stage Scores</h2></div>
                      <div className="space-y-3">
                        {allStages.map(stage => (
                          <div key={stage.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-2 h-2 rounded-full ${stage.status === "passed" || stage.status === "completed" ? "bg-emerald-500" : stage.status === "failed" ? "bg-red-500" : stage.status === "in_progress" ? "bg-yale-blue-500" : "bg-slate-300"}`} />
                              <span className="text-sm text-slate-700">{stage.recruitment_stages?.name || "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {stage.score != null && (
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${stage.score >= 80 ? "bg-emerald-50 text-emerald-700" : stage.score >= 60 ? "bg-blue-50 text-blue-700" : stage.score >= 40 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{Math.round(stage.score)}</span>
                              )}
                              <span className={`text-[10px] font-semibold ${stage.status === "passed" || stage.status === "completed" ? "text-emerald-600" : stage.status === "failed" ? "text-red-600" : stage.status === "in_progress" ? "text-yale-blue-600" : "text-slate-400"}`}>
                                {stage.status === "in_progress" ? "In Progress" : stage.status?.charAt(0).toUpperCase() + stage.status?.slice(1) || "Pending"}
                              </span>
                            </div>
                          </div>
                        ))}
                        {allStages.length === 0 && <p className="text-sm text-slate-400 italic">No stages available.</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assessments & Interviews Section — matches CandidateAssessmentsPage */}
                {stagesWithQuestions.length > 0 && (
                  <div className="mt-8">
                    <div className="rounded-2xl bg-gradient-to-br from-yale-blue-600 via-rich-cerulean to-deep-space-blue p-8 shadow-lg relative overflow-hidden mb-6">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                      <div className="relative flex items-center justify-between">
                        <div>
                          <h1 className="text-2xl font-bold text-white">Assessments & Interviews</h1>
                          <p className="text-sm text-sky-blue-800 mt-1 font-medium">{candidate.full_name || selectedJob?.title}</p>
                        </div>
                        {!isEmpty && (
                          <div className="text-right">
                            <span className="text-xs text-sky-blue-800 font-semibold bg-white/15 px-3 py-1.5 rounded-lg">
                              {stagesWithQuestions.reduce((a, s) => a + s.questions.length, 0)} total questions
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <StageSelector stages={stagesWithQuestions} activeStage={activeStage} onSelect={setActiveStage} />

                    {isEmpty ? (
                      <div className="bg-white rounded-2xl border border-cerulean-900 p-12 text-center mt-6">
                        <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-slate-700 mb-1">No Assessment Data</h2>
                        <p className="text-sm text-slate-400">You have not completed any interviews or assessments for this application yet.</p>
                      </div>
                    ) : activeStage ? (
                      <div className="mt-6 space-y-6">
                        <div className="bg-white rounded-2xl border border-cerulean-900 p-5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-gradient-to-br from-yale-blue-600 to-deep-space-blue text-white">
                                {(() => { const StageIcon = STAGE_ICONS[activeStage.recruitment_stages?.stage_type] || Brain; return <StageIcon className="w-5 h-5" />; })()}
                              </div>
                              <div>
                                <h2 className="font-bold text-slate-900">{activeStage.recruitment_stages?.name}</h2>
                                <p className="text-xs text-slate-500 capitalize">{activeStage.recruitment_stages?.stage_type?.replace(/_/g, " ")}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {activeStage.score != null && (
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${activeStage.score >= 80 ? "bg-emerald-50 text-emerald-700" : activeStage.score >= 60 ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                                  {Math.round(activeStage.score)}/100
                                </span>
                              )}
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${activeStage.status === "passed" ? "bg-emerald-50 text-emerald-700" : activeStage.status === "failed" ? "bg-red-50 text-red-700" : activeStage.status === "in_progress" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                                {activeStage.status?.charAt(0).toUpperCase() + activeStage.status?.slice(1)}
                              </span>
                            </div>
                          </div>
                          {(() => {
                            const evals = activeStage.application_stage_evaluations;
                            const evalData = Array.isArray(evals) ? evals[0] : evals;
                            if (!evalData) return null;
                            return (
                              <div className="mt-4 pt-4 border-t border-cerulean-900 grid grid-cols-3 gap-4">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recommendation</span>
                                  <p className={`text-sm font-bold mt-0.5 ${evalData.recommendation === "proceed" ? "text-emerald-700" : evalData.recommendation === "review" ? "text-amber-700" : "text-red-700"}`}>
                                    {evalData.recommendation?.charAt(0).toUpperCase() + evalData.recommendation?.slice(1) || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confidence</span>
                                  <p className="text-sm font-bold text-slate-700 mt-0.5">{evalData.confidence != null ? `${Math.round(Number(evalData.confidence) * 100)}%` : "N/A"}</p>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Questions</span>
                                  <p className="text-sm font-bold text-slate-700 mt-0.5">{activeStage.questions?.length || 0}</p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="space-y-3">
                          {activeStage.questions.map((q, i) => <ExpandableQuestion key={q.id} question={q} index={i} />)}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
