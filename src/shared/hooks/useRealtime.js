import { useEffect } from "react";
import { supabase } from "@/shared/services/supabase";

/**
 * Realtime hook for applicants on the website.
 * Listens to status/stage changes on the applicant's own applications.
 *
 * @param {string} userId - User profile ID
 * @param {Function} setToast - Function to set active toast notifications
 */
export function useRealtimeApplicant(userId, setToast) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`web-applicant-realtime-${userId}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
          filter: `candidate_profile_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[Realtime Web] Application change for applicant:", payload.eventType);
          if (payload.eventType === "UPDATE") {
            if (payload.new.current_stage_id !== payload.old.current_stage_id) {
              setToast({
                type: "success",
                message: "Your application status has been updated.",
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, setToast]);
}

/**
 * Realtime hook for recruiters on the website.
 * Listens to application events (inserts, updates, deletes) belonging to jobs of the recruiter's company.
 *
 * @param {string} companyId - Recruiter's company ID
 * @param {Function} setToast - Function to set active toast notifications
 */
export function useRealtimeRecruiter(companyId, setToast) {
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`web-recruiter-realtime-${companyId}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
        },
        async (payload) => {
          console.log("[Realtime Web] Application change for recruiter:", payload.eventType);
          const jobId = payload.new?.job_id || payload.old?.job_id;
          if (!jobId) return;

          try {
            // Verify the job belongs to this recruiter's company
            const { data: job } = await supabase
              .from("job_postings")
              .select("company_id")
              .eq("id", jobId)
              .single();

            if (job?.company_id === companyId) {
              if (payload.eventType === "INSERT") {
                setToast({
                  type: "success",
                  message: "New application received.",
                });
              } else if (payload.eventType === "UPDATE") {
                setToast({
                  type: "success",
                  message: "An application stage has been updated.",
                });
              } else if (payload.eventType === "DELETE") {
                setToast({
                  type: "success",
                  message: "An application has been removed.",
                });
              }
            }
          } catch (err) {
            console.error("[Realtime Web] Error processing notification:", err.message);
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [companyId, setToast]);
}
