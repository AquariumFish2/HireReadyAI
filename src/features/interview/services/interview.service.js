import { supabase } from "@/shared/services/supabase";

/**
 * Find the currently active (in_progress or pending) interview stage for an application.
 * Excludes cv_review stages.
 */
export const fetchActiveInterviewStage = async (applicationId) => {
  const { data, error } = await supabase
    .from("application_stages")
    .select(`
      id, status,
      recruitment_stages!inner (
        id, name, description, stage_type, pass_score, evaluation_criteria, order_index
      )
    `)
    .eq("application_id", applicationId)
    .in("status", ["in_progress", "pending"]);

  if (error) throw error;

  // Client-side filter: exclude cv_review stages
  const stage = (data ?? []).find(
    (s) => s.recruitment_stages.stage_type !== "cv_review"
  );
  return stage ?? null;
};

/**
 * Fetch existing questions (with answers) for a stage, ordered.
 * Used to resume an in-progress session.
 */
export const fetchStageQuestions = async (applicationStageId) => {
  const { data, error } = await supabase
    .from("application_questions")
    .select(`
      id, question_text, question_type, order_index, generation_context,
      application_answers ( answer_text, score, feedback )
    `)
    .eq("application_stage_id", applicationStageId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
};

/**
 * Call the generate-question edge function.
 * - Pass previousAnswer=null to get the very first question.
 * - Pass previousAnswer={questionId, answerText} to evaluate + get next question.
 *
 * Returns:
 * {
 *   question: { id, text, type, options, language, orderIndex } | null,
 *   answerEvaluation: { score, feedback, strengths, improvements } | null,
 *   isFinal: boolean,
 *   stageSummary: { overall_score, recommendation, reasoning } | null
 * }
 */
export const generateNextQuestion = async (applicationStageId, previousAnswer = null) => {
  // Use raw fetch instead of supabase.functions.invoke so we can always read
  // the response body — invoke throws a generic "non-2xx" error and loses the
  // actual error message returned by the edge function.
  const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey  = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(`${supabaseUrl}/functions/v1/generate-question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseKey}`,
      "apikey": supabaseKey,
    },
    body: JSON.stringify({ applicationStageId, previousAnswer }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Edge function returned non-JSON (status ${res.status})`);
  }

  if (!res.ok) {
    // Surface the actual error from the edge function body
    const detail = data?.error ?? data?.message ?? JSON.stringify(data);
    console.error(`generate-question HTTP ${res.status}:`, detail);
    throw new Error(`Interview AI error (${res.status}): ${detail}`);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
};
