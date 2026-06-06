// src\features\applicant\components\StatsCards.jsx

import { APPLICATION_STAGE } from "@/shared/constants/enums";
import { useTranslation } from "react-i18next";
export default function StatsCards({ applications }) {
  const { t } = useTranslation();

  const stats = [
    {
      label: t("applicant_dashboard.stats.applications"),
      value: applications?.length || 0,
    },
    {
      label: t("applicant_dashboard.stats.interviews"),
      value:
        applications?.filter(
          (a) => a.current_stage === APPLICATION_STAGE.interview,
        ).length || 0,
    },
    {
      label: t("applicant_dashboard.stats.offers"),
      value:
        applications?.filter((a) => a.current_stage === APPLICATION_STAGE.hired)
          .length || 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-sm text-gray-500">{s.label}</p>
          <h2 className="text-2xl font-bold text-gray-800">{s.value}</h2>
        </div>
      ))}
    </div>
  );
}
