import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoQuestion from "../components/VideoQuestion";
import TextQuestion from "../components/TextQuestion";
import MultipleChoiceQuestion from "../components/MultipleChoiceQuestion";
import CodeQuestion from "../components/CodeQuestion";
import {
  fetchActiveInterviewStage,
  fetchStageQuestions,
  generateNextQuestion,
} from "../services/interview.service";

// ─── Phase constants ──────────────────────────────────────────────────────────
const PHASE = {
  INIT: "init",        // loading stage + existing questions
  LOADING: "loading",  // calling AI edge function
  ANSWERING: "answering",
  EVALUATING: "evaluating", // waiting for AI to evaluate + generate next
  FINISHED: "finished",
  ERROR: "error",
};

// ─── Stage type label ─────────────────────────────────────────────────────────
const stageTypeLabel = {
  hr_interview: "HR Interview",
  technical_interview: "Technical Interview",
  assessment: "Assessment",
  interview: "Interview",
};

// ─── Question component map ───────────────────────────────────────────────────
function QuestionComponent({ question, applicationStageId, onAnswer }) {
  const props = { question, onAnswer };
  switch (question?.type) {
    case "video":
      return <VideoQuestion {...props} applicationStageId={applicationStageId} />;
    case "multiple_choice":
      return <MultipleChoiceQuestion {...props} />;
    case "code":
      return <CodeQuestion {...props} />;
    case "text":
    default:
      return <TextQuestion {...props} />;
  }
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, max }) {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Loading spinner ──────────────────────────────────────────────────────────
function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative size-12">
        <div className="size-12 rounded-full border-4 border-secondary" />
        <div className="absolute inset-0 size-12 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InterviewPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState(PHASE.INIT);
  const [applicationStage, setApplicationStage] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [maxQuestions, setMaxQuestions] = useState(8);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // ── Init: find the active stage, check for resume ──────────────────────────
  useEffect(() => {
    if (!applicationId) return;
    (async () => {
      try {
        const stage = await fetchActiveInterviewStage(applicationId);
        if (!stage) {
          setErrorMsg("No active interview stage found for this application.");
          setPhase(PHASE.ERROR);
          return;
        }

        setApplicationStage(stage);
        const mq = stage.recruitment_stages.evaluation_criteria?.max_questions ?? 8;
        setMaxQuestions(mq);

        // Check for existing questions (resume scenario)
        // NOTE: application_answers is a single object (one-to-one join), NOT an array.
        const existingQuestions = await fetchStageQuestions(stage.id);

        // Helper: does this question have a saved answer?
        const hasAnswer = (q) => {
          const ans = q.application_answers;
          if (!ans) return false;
          if (Array.isArray(ans)) return ans.length > 0 && ans[0]?.answer_text != null;
          return ans.answer_text != null;
        };

        const getAnswerText = (q) => {
          const ans = q.application_answers;
          if (!ans) return null;
          if (Array.isArray(ans)) return ans[0]?.answer_text ?? null;
          return ans.answer_text ?? null;
        };

        const answered = existingQuestions.filter(hasAnswer);
        const unanswered = existingQuestions.find((q) => !hasAnswer(q));

        if (existingQuestions.length === 0) {
          // Fresh session — get first question
          await requestNextQuestion(stage.id, null, 0);
        } else if (unanswered) {
          // Resume: show the first unanswered question already in DB (no AI call needed)
          setCurrentQuestion({
            id: unanswered.id,
            text: unanswered.question_text,
            type: unanswered.question_type,
            options: unanswered.generation_context?.options ?? null,
            language: unanswered.generation_context?.language ?? null,
            orderIndex: unanswered.order_index,
          });
          setQuestionNumber(unanswered.order_index ?? answered.length + 1);
          setPhase(PHASE.ANSWERING);
        } else {
          // All existing questions have answers — ask AI for the next question
          const lastAnswered = answered[answered.length - 1];
          const lastAnswerText = getAnswerText(lastAnswered);
          await requestNextQuestion(
            stage.id,
            { questionId: lastAnswered.id, answerText: lastAnswerText ?? "" },
            answered.length
          );
        }
      } catch (err) {
        console.error("Interview init error:", err);
        setErrorMsg(err.message ?? "Failed to load interview session.");
        setPhase(PHASE.ERROR);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  // ── Request the next question from AI ─────────────────────────────────────
  const requestNextQuestion = async (stageId, previousAnswer, currentAnsweredCount) => {
    setPhase(previousAnswer ? PHASE.EVALUATING : PHASE.LOADING);

    try {
      const result = await generateNextQuestion(stageId, previousAnswer);

      if (result.isFinal) {
        setSessionSummary(result.stageSummary);
        setPhase(PHASE.FINISHED);
        return;
      }

      setCurrentQuestion(result.question);
      setQuestionNumber(result.question?.orderIndex ?? currentAnsweredCount + 1);
      setPhase(PHASE.ANSWERING);
    } catch (err) {
      console.error("generate-question error:", err);
      setErrorMsg(err.message ?? "Failed to generate interview question.");
      setPhase(PHASE.ERROR);
    }
  };

  // ── Handle answer submission ───────────────────────────────────────────────
  const handleAnswer = async (answerText) => {
    if (!currentQuestion || !applicationStage) return;
    await requestNextQuestion(
      applicationStage.id,
      { questionId: currentQuestion.id, answerText },
      questionNumber
    );
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const stage = applicationStage?.recruitment_stages;
  const stageLabel = stageTypeLabel[stage?.stage_type] ?? stage?.name ?? "Interview";
  const scoreColor =
    sessionSummary?.overall_score >= 70
      ? "text-success"
      : sessionSummary?.overall_score >= 50
      ? "text-warning"
      : "text-destructive";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border h-14 flex items-center px-6 gap-4">
        {/* Logo mark */}
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center flex-none">
          <span className="text-white text-sm font-bold font-display">H</span>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <span className="text-xs text-muted-foreground">
            {stage?.name ?? "Interview"}
          </span>
          {phase === PHASE.ANSWERING && (
            <ProgressBar current={questionNumber} max={maxQuestions} />
          )}
        </div>

        {/* Stage badge */}
        <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium bg-[#2c7da0]/10 text-[#2c7da0] border-[#2c7da0]/20">
          {stageLabel}
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-6">

          {/* ── INIT / LOADING ─────────────────────────────────────────── */}
          {(phase === PHASE.INIT || phase === PHASE.LOADING) && (
            <div className="bg-card rounded-2xl border shadow-[var(--shadow-card)] p-8">
              <Spinner label="Preparing your first question…" />
            </div>
          )}

          {/* ── EVALUATING ─────────────────────────────────────────────── */}
          {phase === PHASE.EVALUATING && (
            <div className="bg-card rounded-2xl border shadow-[var(--shadow-card)] p-8">
              <Spinner label="Evaluating your answer and generating the next question…" />
            </div>
          )}

          {/* ── ANSWERING ──────────────────────────────────────────────── */}
          {phase === PHASE.ANSWERING && currentQuestion && (
            <>
              {/* Question header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 border border-primary/20">
                    Q{questionNumber} / {maxQuestions}
                  </span>
                  <span className="rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                    {currentQuestion.type.replace("_", " ")}
                  </span>
                </div>
                <h2 className="font-display text-xl font-semibold text-foreground leading-snug">
                  {currentQuestion.text}
                </h2>
              </div>

              {/* Answer card */}
              <div className="bg-card rounded-2xl border shadow-[var(--shadow-card)] p-6">
                <QuestionComponent
                  question={currentQuestion}
                  applicationStageId={applicationStage?.id}
                  onAnswer={handleAnswer}
                />
              </div>

              {/* Progress context */}
              <p className="text-center text-xs text-muted-foreground">
                {maxQuestions - questionNumber > 0
                  ? `${maxQuestions - questionNumber} question${maxQuestions - questionNumber !== 1 ? "s" : ""} remaining`
                  : "This is the final question"}
              </p>
            </>
          )}

          {/* ── FINISHED ───────────────────────────────────────────────── */}
          {phase === PHASE.FINISHED && (
            <div className="bg-card rounded-2xl border shadow-[var(--shadow-card)] p-8 space-y-8 text-center">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="size-8 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  Interview Complete
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Your responses have been submitted and evaluated. The hiring team will review the results.
                </p>
              </div>

              {/* Score */}
              {sessionSummary && (
                <div className="rounded-xl border bg-secondary/50 p-6 space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Overall Score</span>
                    <span className={`font-display text-3xl font-semibold tracking-tight ${scoreColor}`}>
                      {sessionSummary.overall_score}
                      <span className="text-base font-normal text-muted-foreground">/100</span>
                    </span>
                  </div>

                  {sessionSummary.recommendation && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Recommendation:</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium border capitalize ${
                          sessionSummary.recommendation === "proceed"
                            ? "bg-success/10 text-success border-success/20"
                            : sessionSummary.recommendation === "reject"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-warning/15 text-[#8a5a00] border-warning/30"
                        }`}
                      >
                        {sessionSummary.recommendation}
                      </span>
                    </div>
                  )}

                  {sessionSummary.reasoning && (
                    <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                      {sessionSummary.reasoning}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => navigate(`/applications/${applicationId}`)}
                className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Back to Application
              </button>
            </div>
          )}

          {/* ── ERROR ──────────────────────────────────────────────────── */}
          {phase === PHASE.ERROR && (
            <div className="bg-card rounded-2xl border shadow-[var(--shadow-card)] p-8 space-y-6 text-center">
              <div className="size-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <svg className="size-7 text-destructive" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-semibold text-foreground">Something went wrong</h3>
                <p className="text-sm text-muted-foreground">{errorMsg}</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="border bg-background text-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}