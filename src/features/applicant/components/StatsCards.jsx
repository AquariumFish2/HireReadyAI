import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APPLICATION_STAGE } from "@/shared/constants/enums";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StatsCards({ applications }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showRejected, setShowRejected] = useState(false);

  const rejectedApps = (applications || []).filter(
    a => a.current_stage === APPLICATION_STAGE.rejected || a.is_rejected === true,
  );

  const stats = [
    {
      label: t("applicant_dashboard.stats.applications"),
      value: applications?.length || 0,
      color: "#01497c",
      bg: "#eef7fa",
    },
    {
      label: t("applicant_dashboard.stats.interviews"),
      value: applications?.filter(a => a.current_stage === APPLICATION_STAGE.interview).length || 0,
      color: "#01497c",
      bg: "#eef7fa",
    },
    {
      label: t("applicant_dashboard.stats.offers"),
      value: applications?.filter(a => a.current_stage === APPLICATION_STAGE.hired).length || 0,
      color: "#15803d",
      bg: "rgba(22,163,74,0.08)",
    },
    {
      label: "Rejected",
      value: rejectedApps.length,
      color: "#b91c1c",
      bg: "rgba(185,28,28,0.06)",
      isRejected: true,
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: showRejected ? "12px" : 0,
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              onClick={s.isRejected ? () => setShowRejected(!showRejected) : undefined}
              style={{
                background: "#fff",
                border: `1px solid ${s.isRejected && showRejected ? "#b91c1c" : "#cfe7f2"}`,
                borderRadius: "12px",
                padding: "16px 20px",
                boxShadow: "0 1px 2px rgba(1,42,74,.04), 0 1px 3px rgba(1,42,74,.06)",
                cursor: s.isRejected ? "pointer" : "default",
                transition: "all 0.2s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => {
                if (s.isRejected) {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(185,28,28,0.12)";
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "0 1px 2px rgba(1,42,74,.04), 0 1px 3px rgba(1,42,74,.06)";
              }}
            >
              <p style={{ fontSize: "12px", fontWeight: "600", color: s.isRejected ? "#b91c1c" : "#2a6f97", margin: "0 0 4px", letterSpacing: "0.02em" }}>
                {s.label}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "28px", fontWeight: "700", color: s.color, margin: 0, lineHeight: 1 }}>
                  {s.value}
                </h2>
                {s.isRejected && s.value > 0 && (
                  <span style={{ color: "#b91c1c", transition: "transform 0.2s", transform: showRejected ? "rotate(180deg)" : "none" }}>
                    {showRejected ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Rejected applications list */}
        {showRejected && rejectedApps.length > 0 && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #cfe7f2",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 1px 2px rgba(1,42,74,.04), 0 1px 3px rgba(1,42,74,.06)",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #eef7fa",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={14} color="#b91c1c" />
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#b91c1c" }}>
                Rejected Applications
              </span>
            </div>
            {rejectedApps.map((app) => {
              const job = app.job_postings;
              const company = job?.companies;
              return (
                <div
                  key={app.id}
                  style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid #eef7fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#012a4a" }}>
                      {job?.title || "Unknown Position"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#2a6f97" }}>
                      {company?.name}{app.applied_at ? ` · Applied ${formatDate(app.applied_at)}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/applicant/feedback?appId=${app.id}`)}
                    style={{
                      flexShrink: 0,
                      padding: "6px 14px",
                      background: "transparent",
                      border: "1px solid #b91c1c",
                      borderRadius: "8px",
                      color: "#b91c1c",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#b91c1c";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#b91c1c";
                    }}
                  >
                    Show Feedback
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
