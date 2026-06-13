import { supabase } from "./supabase";

/**
 * Sends a push notification by invoking the Supabase Edge Function.
 *
 * @param {Object} params
 * @param {string} params.token   - Expo push token of the recipient
 * @param {string} params.title   - Notification title
 * @param {string} params.body    - Notification body
 * @param {Object} [params.data]  - Optional payload data
 */
export async function sendPushNotification({ token, title, body, data = {} }) {
  if (!token) return;

  try {
    const { error } = await supabase.functions.invoke("send-push-notification", {
      body: { token, title, body, data },
    });

    if (error) {
      console.warn("[Notifications] Edge function warning:", error.message);
    }
  } catch (err) {
    console.warn("[Notifications] sendPushNotification failed:", err.message);
  }
}

/**
 * Notifies a candidate when their application is moved to a new stage.
 *
 * @param {string} applicationId
 * @param {string} targetStageId
 */
export async function notifyStageChange(applicationId, targetStageId) {
  try {
    // 1. Fetch the application, applicant profile, and job details
    const { data: app } = await supabase
      .from("applications")
      .select(`
        candidate_profile_id,
        profiles ( expo_push_token, full_name ),
        job_postings ( title )
      `)
      .eq("id", applicationId)
      .single();

    const pushToken = app?.profiles?.expo_push_token;
    const jobTitle = app?.job_postings?.title ?? "your application";

    if (!pushToken) return; // No token registered

    // 2. Fetch the target stage name and type
    const { data: stage } = await supabase
      .from("recruitment_stages")
      .select("name, stage_type")
      .eq("id", targetStageId)
      .single();

    if (stage) {
      const stageMessages = {
        shortlist: `Great news! You have been shortlisted for "${jobTitle}"`,
        offer:     `Congratulations! You have received an offer for "${jobTitle}"`,
      };

      const body =
        stageMessages[stage.stage_type] ??
        `Your application for "${jobTitle}" has moved to the ${stage.name} stage.`;

      await sendPushNotification({
        token: pushToken,
        title: "Application Update",
        body,
        data: {
          type: "stage_update",
          application_id: applicationId,
          stage_id: targetStageId,
          stage_type: stage.stage_type,
        },
      });
    }
  } catch (err) {
    console.warn("[Notifications] Error in notifyStageChange:", err.message);
  }
}

/**
 * Notifies all recruiters of a company when a candidate applies to a job.
 *
 * @param {Object} application - The newly created application object
 */
export async function notifyNewApplication(application) {
  try {
    if (!application?.id || !application?.job_id) return;

    // 1. Fetch the job details and company ID
    const { data: job } = await supabase
      .from("job_postings")
      .select("title, company_id")
      .eq("id", application.job_id)
      .single();

    if (!job?.company_id) return;

    // 2. Fetch up to 5 recruiters associated with the company who have push tokens
    const { data: members } = await supabase
      .from("company_memberships")
      .select(`
        profile_id,
        profiles ( expo_push_token )
      `)
      .eq("company_id", job.company_id)
      .limit(5);

    if (!members || members.length === 0) return;

    // 3. Fetch the applicant's name
    const { data: applicantProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", application.candidate_profile_id)
      .single();

    const applicantName = applicantProfile?.full_name ?? "A candidate";

    // 4. Send the push notification to each recruiter with a token
    for (const member of members) {
      const token = member.profiles?.expo_push_token;
      if (token) {
        sendPushNotification({
          token,
          title: "New Application Received",
          body: `${applicantName} applied for "${job.title}"`,
          data: {
            type: "new_application",
            application_id: application.id,
            job_id: application.job_id,
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Notifications] Error in notifyNewApplication:", err.message);
  }
}
