// src/features/applicant/components/ApplicationsList.jsx
import { useNavigate } from "react-router-dom";
import { APPLICATION_STAGE } from "@/shared/constants/enums";
import {
  Briefcase,
  Clock,
  Calendar,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Stage config with HireReadyAI pipeline colors
const stageConfig = {
  [APPLICATION_STAGE.applied]: {
    label: "Applied",
    bg: "rgba(137,194,217,0.15)",
    text: "#2c7da0",
    border: "rgba(137,194,217,0.4)",
    dot: "#89c2d9",
  },
  [APPLICATION_STAGE.screening]: {
    label: "Screening",
    bg: "rgba(97,165,194,0.15)",
    text: "#2a6f97",
    border: "rgba(97,165,194,0.4)",
    dot: "#61a5c2",
  },
  [APPLICATION_STAGE.shorListed]: {
    label: "Shortlisted",
    bg: "rgba(44,125,160,0.12)",
    text: "#01497c",
    border: "rgba(44,125,160,0.35)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.interview]: {
    label: "Interview",
    bg: "rgba(1,73,124,0.12)",
    text: "#01497c",
    border: "rgba(1,73,124,0.3)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.hired]: {
    label: "Hired",
    bg: "rgba(22,163,74,0.1)",
    text: "#15803d",
    border: "rgba(22,163,74,0.25)",
    dot: "#22c55e",
  },
  [APPLICATION_STAGE.rejected]: {
    label: "Rejected",
    bg: "rgba(185,28,28,0.08)",
    text: "#b91c1c",
    border: "rgba(185,28,28,0.2)",
    dot: "#ef4444",
  },
  cv_review: {
    label: "CV Review",
    color: "bg-slate-100 text-slate-700",
  },
  shortlist: {
    label: "Shortlisting",
    color: "bg-purple-100 text-purple-700",
  },
  [APPLICATION_STAGE.cv_screening]: {
    label: "CV Screening",
    bg: "rgba(42,111,151,0.1)",
    text: "#2a6f97",
    border: "rgba(42,111,151,0.25)",
    dot: "#2a6f97",
  },
  [APPLICATION_STAGE.ai_screening]: {
    label: "AI Screening",
    bg: "rgba(70,143,175,0.12)",
    text: "#01497c",
    border: "rgba(70,143,175,0.3)",
    dot: "#468faf",
  },
  [APPLICATION_STAGE.assessment_test]: {
    label: "Assessment Test",
    bg: "rgba(44,125,160,0.12)",
    text: "#2c7da0",
    border: "rgba(44,125,160,0.3)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.coding_test]: {
    label: "Coding Test",
    bg: "rgba(1,73,124,0.1)",
    text: "#01497c",
    border: "rgba(1,73,124,0.28)",
    dot: "#01497c",
  },
  [APPLICATION_STAGE.video_interview]: {
    label: "Video Interview",
    bg: "rgba(97,165,194,0.13)",
    text: "#2a6f97",
    border: "rgba(97,165,194,0.35)",
    dot: "#61a5c2",
  },
  [APPLICATION_STAGE.technical_interview]: {
    label: "Technical Interview",
    bg: "rgba(1,73,124,0.1)",
    text: "#01497c",
    border: "rgba(1,73,124,0.28)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.hr_interview]: {
    label: "HR Interview",
    bg: "rgba(70,143,175,0.12)",
    text: "#01497c",
    border: "rgba(70,143,175,0.3)",
    dot: "#468faf",
  },
  [APPLICATION_STAGE.manager_interview]: {
    label: "Manager Interview",
    bg: "rgba(42,111,151,0.12)",
    text: "#2a6f97",
    border: "rgba(42,111,151,0.3)",
    dot: "#2a6f97",
  },
  [APPLICATION_STAGE.background_check]: {
    label: "Background Check",
    bg: "rgba(234,179,8,0.1)",
    text: "#854d0e",
    border: "rgba(234,179,8,0.25)",
    dot: "#eab308",
  },
  [APPLICATION_STAGE.offer]: {
    label: "Offer",
    bg: "rgba(22,163,74,0.12)",
    text: "#15803d",
    border: "rgba(22,163,74,0.3)",
    dot: "#22c55e",
  },
};

const defaultStage = {
  label: "Processing",
  bg: "rgba(42,111,151,0.1)",
  text: "#2a6f97",
  border: "rgba(42,111,151,0.25)",
  dot: "#2a6f97",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function StagePill({ label, config }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        borderRadius: "999px",
        padding: "3px 10px",
        fontSize: "11px",
        fontWeight: "600",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: config.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}

export default function ApplicationsList({ applications }) {
  const navigate = useNavigate();

  const getActiveStage = (app) => {
    if (!app.application_stages || !Array.isArray(app.application_stages))
      return null;
    const sortedStages = [...app.application_stages].sort((a, b) => {
      const orderA = a.recruitment_stages?.order_index || 0;
      const orderB = b.recruitment_stages?.order_index || 0;
      return orderA - orderB;
    });
    const inProgressStage = sortedStages.find(
      (s) => s.status === "in_progress",
    );
    if (inProgressStage) return inProgressStage;
    return sortedStages.find((s) => s.status === "pending");
  };
  const { t } = useTranslation();
  const showViewAll = applications && applications.length > 3;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "1rem",
        border: "1px solid #cfe7f2",
        boxShadow: "0 1px 2px rgba(1,42,74,.04), 0 1px 3px rgba(1,42,74,.06)",
        overflow: "hidden",
      }}
    >
      {/* Card Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid #cfe7f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              background: "#eef7fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#01497c",
            }}
          >
            <Layers size={16} />
          </div>
          <div>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "15px",
                fontWeight: "700",
                color: "#012a4a",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {t("applications.title")}
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "#2a6f97",
                margin: 0,
                marginTop: "1px",
              }}
            >
              {t("applications.subtitle")}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {applications && applications.length > 0 && (
            <span
              style={{
                background: "#01497c",
                color: "white",
                borderRadius: "999px",
                width: "22px",
                height: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              {applications.length}
            </span>
          )}
          {showViewAll && (
            <button
              onClick={() => navigate("/applications")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#01497c",
                background: "transparent",
                border: "1px solid #cfe7f2",
                borderRadius: "8px",
                padding: "5px 12px",
                cursor: "pointer",
              }}
            >
              {t("applications.view_all")}
              <ArrowUpRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 24px 20px" }}>
        {!applications || applications.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "36px 0",
              color: "#2a6f97",
            }}
          >
            <Briefcase
              size={32}
              style={{ margin: "0 auto 10px", opacity: 0.4 }}
            />
            <p style={{ fontSize: "13px", margin: 0 }}>
              {t("applications.empty")}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {applications
              .slice(0, showViewAll ? 4 : applications.length)
              .map((app) => {
                const job = app.job_postings;
                const company = job?.companies;
                const activeStage = getActiveStage(app);

                let displayLabel = app.current_stage;
                let stageStyle = stageConfig[app.current_stage] || defaultStage;

                if (activeStage) {
                  const type = activeStage.recruitment_stages?.stage_type;
                  displayLabel =
                    activeStage.recruitment_stages?.name || "Processing";
                  stageStyle = stageConfig[type] || defaultStage;
                } else if (stageConfig[app.current_stage]) {
                  displayLabel = stageConfig[app.current_stage].label;
                }

                return (
                  <div
                    key={app.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #cfe7f2",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#eef7fa";
                      e.currentTarget.style.borderColor = "#89c2d9";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 30px -12px rgba(1,42,74,.18)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = "#cfe7f2";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Stage pill top-right */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#012a4a",
                          margin: 0,
                          letterSpacing: "-0.01em",
                          lineHeight: "1.3",
                          flex: 1,
                          paddingRight: "8px",
                        }}
                      >
                        {job?.title || t("applications.unknown_position")}
                      </h3>
                      <StagePill label={displayLabel} config={stageStyle} />
                    </div>

                    {/* Company */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "10px",
                      }}
                    >
                      <Briefcase
                        size={12}
                        style={{ color: "#2a6f97", flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#2a6f97",
                          fontWeight: "500",
                        }}
                      >
                        {company?.name || t("applications.unknown_company")}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        borderTop: "1px solid #eef7fa",
                        paddingTop: "8px",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          color: "#2a6f97",
                        }}
                      >
                        <Clock size={10} />
                        {t("applications.applied", {
                          date: formatDate(app.applied_at),
                        })}
                      </span>
                      {job?.closed_at && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            color: "#2a6f97",
                          }}
                        >
                          <Calendar size={10} />
                          {t("applications.closes", {
                            date: formatDate(job.closed_at),
                          })}
                        </span>
                      )}
                    </div>

                    {/* Open button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${job?.id}`);
                      }}
                      style={{
                        marginTop: "10px",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        background: "transparent",
                        border: "1px solid #cfe7f2",
                        borderRadius: "8px",
                        padding: "6px 0",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#01497c",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#01497c";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.borderColor = "#01497c";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#01497c";
                        e.currentTarget.style.borderColor = "#cfe7f2";
                      }}
                    >
                      {t("applications.view_job")}
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
