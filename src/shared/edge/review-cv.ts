import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "Qwen/Qwen2.5-7B-Instruct";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildPrompt(params: {
  jobTitle: string;
  jobDescription: string;
  jobSkills: string[];
  jobRequirements: string[];
  cvText: string;
  applicationAnswers: Record<string, unknown>;
}): string {
  const { jobTitle, jobDescription, jobSkills, jobRequirements, cvText, applicationAnswers } = params;

  const qaSection =
    applicationAnswers && Object.keys(applicationAnswers).length
      ? `\n\nApplication Q&A submitted by the candidate:\n${JSON.stringify(applicationAnswers, null, 2)}`
      : "";

  return `You are an expert technical recruiter evaluating a candidate's CV for a job opening.

JOB POSTING:
Title: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${jobSkills?.join(", ") || "Not specified"}
Requirements: ${jobRequirements?.join("; ") || "Not specified"}
${qaSection}

CANDIDATE CV TEXT:
${cvText.slice(0, 8000)}

Evaluate the CV against the job posting and return ONLY a valid JSON object with exactly these fields, no extra text, no markdown, no code blocks:
{
  "cv_score": <integer 0-100>,
  "feedback": "<3-5 sentence overall assessment suitable for the hiring team>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "recommendation": "<one of: proceed | review | reject>",
  "dimension_scores": {
    "technical_skills": <integer 0-100>,
    "experience_match": <integer 0-100>,
    "education": <integer 0-100>,
    "soft_skills": <integer 0-100>
  }
}

Scoring guide for cv_score:
- 85-100: Exceptional match, highly recommended
- 70-84: Good match, worth proceeding
- 55-69: Partial match, needs review
- 0-54: Poor match, consider rejecting

Rules:
- Base your score only on information present in the CV and Q&A
- Be concise but specific in feedback and gaps
- Do not include any text outside the JSON object`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const { applicationId, cvText } = await req.json();
  if (!applicationId || !cvText) {
    return new Response(
      JSON.stringify({ error: "applicationId and cvText are required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SB_SERVICE_KEY") ?? "",
  );

  // ── 1. Fetch application ──────────────────────────────────────────────────
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("id, job_id, cv_file_url, answers")
    .eq("id", applicationId)
    .single();

  if (appError || !application) {
    return new Response(
      JSON.stringify({ error: "Application not found", details: appError }),
      { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (!application.cv_file_url) {
    return new Response(
      JSON.stringify({ error: "No CV file attached to this application" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // ── 2. Fetch job posting ──────────────────────────────────────────────────
  const { data: job, error: jobError } = await supabase
    .from("job_postings")
    .select("title, description, skills, requirements")
    .eq("id", application.job_id)
    .single();

  if (jobError || !job) {
    return new Response(
      JSON.stringify({ error: "Job not found", details: jobError }),
      { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // ── 3. Find the CV Review application_stage ───────────────────────────────
  const { data: cvStageRow } = await supabase
    .from("application_stages")
    .select("id, recruitment_stages!inner(stage_type, order_index)")
    .eq("application_id", applicationId)
    .eq("recruitment_stages.stage_type", "cv_review")
    .maybeSingle();

  // Mark as in_progress (if not already)
  if (cvStageRow?.id) {
    await supabase
      .from("application_stages")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", cvStageRow.id);
  }

  try {
    if (cvText.length < 50) {
      throw new Error("CV appears to be empty or unreadable (insufficient text extracted)");
    }

    // ── 5. Call HuggingFace Qwen ────────────────────────────────────────────
    const prompt = buildPrompt({
      jobTitle: job.title,
      jobDescription: job.description,
      jobSkills: job.skills ?? [],
      jobRequirements: job.requirements ?? [],
      cvText,
      applicationAnswers: application.answers ?? {},
    });

    const hfResponse = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("HUGGINGFACE_API_KEY_CV") ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert technical recruiter. Always respond with valid JSON only. Never include markdown, code blocks, or any text outside the JSON object.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1200,
        temperature: 0.3,
      }),
    });

    if (!hfResponse.ok) {
      const errBody = await hfResponse.json();
      throw new Error(`HuggingFace error: ${JSON.stringify(errBody)}`);
    }

    const hfData = await hfResponse.json();
    let content: string = hfData.choices[0].message.content.trim();

    // Strip any accidental markdown fences
    content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) content = jsonMatch[0];

    let parsed: {
      cv_score: number;
      feedback: string;
      strengths: string[];
      gaps: string[];
      recommendation: string;
      dimension_scores: Record<string, number>;
    };

    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${content}`);
    }

    const cvScore = Math.max(0, Math.min(100, Math.round(parsed.cv_score ?? 0)));

    // ── 6. Write results back to DB ─────────────────────────────────────────
    const feedbackJson = JSON.stringify({
      feedback: parsed.feedback,
      strengths: parsed.strengths,
      gaps: parsed.gaps,
      recommendation: parsed.recommendation,
      dimension_scores: parsed.dimension_scores,
    });

    const stageStatus = cvScore >= 55 ? "passed" : "failed";

    // Update application_stages CV review row
    if (cvStageRow?.id) {
      await supabase
        .from("application_stages")
        .update({
          score: cvScore,
          ai_feedback: feedbackJson,
          status: stageStatus,
          completed_at: new Date().toISOString(),
        })
        .eq("id", cvStageRow.id);

      // Also upsert application_stage_evaluations
      await supabase.from("application_stage_evaluations").upsert(
        {
          application_stage_id: cvStageRow.id,
          ai_score: cvScore,
          confidence: (parsed.dimension_scores?.technical_skills ?? 70) / 100,
          reasoning: parsed.feedback,
          recommendation: parsed.recommendation,
        },
        { onConflict: "application_stage_id" }
      );
    }

    // Update applications.cv_score
    await supabase
      .from("applications")
      .update({ cv_score: cvScore })
      .eq("id", applicationId);

    // If passed, auto-advance candidate to the next stage in the pipeline
    if (stageStatus === "passed" && cvStageRow?.recruitment_stages?.order_index !== undefined) {
      const { data: nextStage } = await supabase
        .from("recruitment_stages")
        .select("id")
        .eq("job_id", application.job_id)
        .gt("order_index", cvStageRow.recruitment_stages.order_index)
        .order("order_index", { ascending: true })
        .limit(1)
        .single();

      if (nextStage) {
        await supabase
          .from("application_stages")
          .upsert({
            application_id: applicationId,
            stage_id: nextStage.id,
            status: "pending",
          }, { onConflict: "application_id,stage_id" });
      }
    }

    return new Response(
      JSON.stringify({
        cv_score: cvScore,
        feedback: parsed.feedback,
        strengths: parsed.strengths,
        gaps: parsed.gaps,
        recommendation: parsed.recommendation,
        dimension_scores: parsed.dimension_scores,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("CV review failed:", msg);

    // Mark stage as failed
    if (cvStageRow?.id) {
      await supabase
        .from("application_stages")
        .update({
          ai_feedback: JSON.stringify({ error: msg }),
          status: "failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", cvStageRow.id);
    }

    return new Response(
      JSON.stringify({ error: msg }),
      { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
