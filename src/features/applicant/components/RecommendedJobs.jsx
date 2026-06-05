import { useEffect, useState } from "react";
import { supabase } from "@/shared/services/supabase";
import { useNavigate } from "react-router-dom";

function formatLabel(str) {
  if (!str) return "";

  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
export default function RecommendedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);

      const { data, error } = await supabase
        .from("job_postings")
        .select(
          `
          id,
          title,
          seniority_level,
          work_location,
          created_at,
          companies (
            name
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error) setJobs(data || []);
      setLoading(false);
    }

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7">
        <p className="text-dark-amethyst-500 text-sm">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7 space-y-5 shadow-sm">
      <h2 className="text-base font-bold text-dark-amethyst-950">
        Recommended for you
      </h2>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex justify-between items-center border-b border-dark-amethyst-100 pb-3 last:border-0 last:pb-0"
          >
            {/* LEFT */}
            <div>
              <p className="text-sm font-semibold text-dark-amethyst-800">
                {job.title}
              </p>

              <p className="text-xs text-dark-amethyst-500">
                {job.companies?.name || "Unknown Company"}
              </p>

              <p className="text-xs text-dark-amethyst-400 mt-0.5">
                {formatLabel(job.work_location) || "Remote"}
              </p>
            </div>

            {/* RIGHT */}
            <button
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="text-xs font-medium text-dark-amethyst-600 border border-dark-amethyst-200 px-3 py-1.5 rounded-xl hover:bg-dark-amethyst-50 transition"
            >
              View role →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
