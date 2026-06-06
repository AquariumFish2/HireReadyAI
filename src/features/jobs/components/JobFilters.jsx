//src\features\jobs\components\JobFilters.jsx
import { SENIORITY_LEVEL } from "@/shared/constants/enums";
import { useTranslation } from "react-i18next";

export default function JobFilters({
  level,
  setLevel,
  jobType,
  setJobType,
  workLocation,
  setWorkLocation,
  datePosted,
  setDatePosted,
  salaryMin,
  setSalaryMin,
  salaryMax,
  setSalaryMax,
  onClear,
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-dark-amethyst-950">
          {t("job_filters.title")}
        </h3>

        <button
          onClick={onClear}
          className="text-xs text-dark-amethyst-500 hover:text-dark-amethyst-700 hover:underline font-medium"
        >
          {t("job_filters.clear_all")}
        </button>
      </div>

      {/* Date Posted */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-dark-amethyst-800 uppercase tracking-wide">
          {t("job_filters.date_posted")}
        </h4>

        <select
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
          className="w-full h-9 px-3 rounded-lg text-sm text-dark-amethyst-800 border border-dark-amethyst-100 bg-dark-amethyst-50 outline-none focus:border-dark-amethyst-400 transition"
        >
          <option value="">{t("job_filters.anytime")}</option>
          <option value="24h">{t("job_filters.last_24h")}</option>
          <option value="week">{t("job_filters.last_week")}</option>
          <option value="month">{t("job_filters.last_month")}</option>
        </select>
      </div>

      {/* Salary */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-dark-amethyst-800 uppercase tracking-wide">
          {t("job_filters.salary")}
        </h4>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder={t("job_filters.min")}
            className="w-full h-9 px-3 rounded-lg text-sm text-dark-amethyst-800 border border-dark-amethyst-100 bg-dark-amethyst-50 outline-none focus:border-dark-amethyst-400 transition placeholder:text-dark-amethyst-300"
          />

          <span className="text-dark-amethyst-300 text-sm shrink-0">
            {t("job_filters.to")}
          </span>

          <input
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder={t("job_filters.max")}
            className="w-full h-9 px-3 rounded-lg text-sm text-dark-amethyst-800 border border-dark-amethyst-100 bg-dark-amethyst-50 outline-none focus:border-dark-amethyst-400 transition placeholder:text-dark-amethyst-300"
          />
        </div>
      </div>

      {/* Job Type */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-dark-amethyst-800 uppercase tracking-wide">
          {t("job_filters.job_type")}
        </h4>

        <div className="space-y-2">
          {[
            { label: t("job_filters.full_time"), value: "full_time" },
            { label: t("job_filters.part_time"), value: "part_time" },
          ].map(({ label, value }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={jobType === value}
                onChange={() => setJobType(jobType === value ? "" : value)}
                className="w-4 h-4 rounded border-dark-amethyst-200 accent-dark-amethyst-600 cursor-pointer"
              />
              <span className="text-sm text-dark-amethyst-700 group-hover:text-dark-amethyst-900 transition">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Work Location */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-dark-amethyst-800 uppercase tracking-wide">
          {t("job_filters.work_location")}
        </h4>

        <div className="space-y-2">
          {[
            { label: t("job_filters.on_site"), value: "on_site" },
            { label: t("job_filters.remote"), value: "remote" },
            { label: t("job_filters.hybrid"), value: "hybrid" },
          ].map(({ label, value }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={workLocation === value}
                onChange={() =>
                  setWorkLocation(workLocation === value ? "" : value)
                }
                className="w-4 h-4 rounded border-dark-amethyst-200 accent-dark-amethyst-600 cursor-pointer"
              />
              <span className="text-sm text-dark-amethyst-700 group-hover:text-dark-amethyst-900 transition">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Seniority */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-dark-amethyst-800 uppercase tracking-wide">
          {t("job_filters.seniority")}
        </h4>

        <div className="space-y-2">
          {Object.values(SENIORITY_LEVEL).map((lvl) => (
            <label
              key={lvl}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={level === lvl}
                onChange={() => setLevel(level === lvl ? "" : lvl)}
                className="w-4 h-4 rounded border-dark-amethyst-200 accent-dark-amethyst-600 cursor-pointer"
              />
              <span className="text-sm text-dark-amethyst-700 group-hover:text-dark-amethyst-900 transition capitalize">
                {lvl}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
