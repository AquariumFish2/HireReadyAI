// src/features/applicant/components/FeedbackTips.jsx
import {
  TrendingUp,
  Lightbulb,
  Sparkles,
  Target,
  BarChart2,
  BookOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
const tips = [
  {
    id: 1,
    type: "success",
    icon: TrendingUp,
    score: "87%",
    title: "Strong pattern recognition",
    description: "You scored in the top 15% for logical sequences.",
    accent: "#01497c",
    bg: "rgba(1,73,124,0.06)",
    border: "rgba(1,73,124,0.16)",
    scoreBg: "#01497c",
    scoreText: "white",
  },
  {
    id: 2,
    type: "warning",
    icon: Lightbulb,
    title: "Pacing could improve",
    description:
      "Try not to spend more than 90s per question on the next test.",
    accent: "#854d0e",
    bg: "rgba(234,179,8,0.05)",
    border: "rgba(234,179,8,0.2)",
    scoreBg: "rgba(234,179,8,0.12)",
    scoreText: "#854d0e",
  },
  {
    id: 3,
    type: "tip",
    icon: BookOpen,
    title: "Add 2 measurable wins to your CV",
    description: "Quantified impact bumps recruiter reply-rate by ~30%.",
    accent: "#2a6f97",
    bg: "rgba(42,111,151,0.05)",
    border: "rgba(42,111,151,0.18)",
    scoreBg: "rgba(42,111,151,0.1)",
    scoreText: "#2a6f97",
  },
];

export default function FeedbackTips() {
  const { t } = useTranslation();
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
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid #cfe7f2",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #01497c, #468faf)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(1,73,124,0.25)",
          }}
        >
          <Sparkles size={17} />
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
            {t("applicant_dashboard.feedback.title")}
          </h2>
          <p
            style={{
              fontSize: "12px",
              color: "#2a6f97",
              margin: 0,
              marginTop: "2px",
            }}
          >
            {t("applicant_dashboard.feedback.subtitle", {
              role: "Front-end Engineer",
              company: "Vodafone",
            })}
          </p>
        </div>
      </div>

      {/* Tips */}
      <div
        style={{
          padding: "16px 24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {tips.map((tip) => {
          const { Icon } = { Icon: tip.icon };
          return (
            <div
              key={tip.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "13px",
                background: tip.bg,
                border: `1px solid ${tip.border}`,
                borderRadius: "12px",
                padding: "14px 16px",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(1,42,74,.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Icon container */}
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  background: tip.scoreBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: tip.scoreText,
                  flexShrink: 0,
                }}
              >
                <tip.icon size={16} />
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {tip.score && (
                    <span
                      style={{
                        background: tip.scoreBg,
                        color: tip.scoreText,
                        borderRadius: "6px",
                        padding: "2px 8px",
                        fontSize: "12px",
                        fontWeight: "700",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {tip.score}
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#012a4a",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {tip.title}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#2a6f97",
                    margin: 0,
                    marginTop: "4px",
                    lineHeight: "1.5",
                  }}
                >
                  {tip.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
