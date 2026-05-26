// components/jobs/JobFilters.jsx

import { SENIORITY_LEVEL } from "@/shared/constants/enums";

export default function JobFilters({ level, setLevel }) {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-4 shadow-sm">
      <h3 className="font-semibold text-gray-900">Filters</h3>

      <select
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        className="w-full p-2 rounded bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-400"
      >
        <option value="">All Levels</option>

        {Object.values(SENIORITY_LEVEL).map((lvl) => (
          <option key={lvl} value={lvl}>
            {lvl}
          </option>
        ))}
      </select>
    </div>
  );
}
