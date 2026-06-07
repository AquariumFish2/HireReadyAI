import { SENIORITY_LEVEL } from "@/shared/constants/enums";

export default function JobFilters({
  level, setLevel,
  jobType, setJobType,
  workLocation, setWorkLocation,
  datePosted, setDatePosted,
  salaryMin, setSalaryMin,
  salaryMax, setSalaryMax,
  onClear,
}) {
  return (
    <div className="bg-background rounded-xl border border-border p-4 space-y-4 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">Filter</h3>
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline font-medium transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Date Posted</h4>
        <select
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
          className="w-full h-8 px-2 rounded-md text-xs text-foreground border border-border bg-muted/50 outline-none focus:ring-1 focus:ring-ring focus:bg-background transition cursor-pointer"
        >
          <option value="">Anytime</option>
          <option value="24h">Last 24 hours</option>
          <option value="week">Last week</option>
          <option value="month">Last month</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Salary Range (EGP)</h4>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="Min"
            className="w-full h-8 px-2 rounded-md text-xs text-foreground border border-border bg-muted/50 outline-none focus:ring-1 focus:ring-ring focus:bg-background transition placeholder:text-muted-foreground/60"
          />
          <span className="text-muted-foreground/50 text-xs shrink-0">to</span>
          <input
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="Max"
            className="w-full h-8 px-2 rounded-md text-xs text-foreground border border-border bg-muted/50 outline-none focus:ring-1 focus:ring-ring focus:bg-background transition placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Job Type</h4>
        <div className="space-y-1.5">
          {[
            { label: 'Full Time', value: 'full_time' },
            { label: 'Part Time', value: 'part_time' },
          ].map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={jobType === value}
                onChange={() => setJobType(jobType === value ? '' : value)}
                className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">On-site / Remote</h4>
        <div className="space-y-1.5">
          {[
            { label: 'On-site', value: 'on_site' },
            { label: 'Remote', value: 'remote' },
            { label: 'Hybrid', value: 'hybrid' },
          ].map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={workLocation === value}
                onChange={() => setWorkLocation(workLocation === value ? '' : value)}
                className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Seniority Level</h4>
        <div className="space-y-1.5">
          {Object.values(SENIORITY_LEVEL).map((lvl) => (
            <label key={lvl} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={level === lvl}
                onChange={() => setLevel(level === lvl ? '' : lvl)}
                className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors capitalize">
                {lvl}
              </span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}