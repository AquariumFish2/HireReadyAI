import { SENIORITY_LEVEL } from "@/shared/constants/enums";
import { useState } from "react";

import JobSearch from "../components/JobSearch";
import JobFilters from "../components/JobFilters";
import JobCard from "../components/JobCard";
import { useJobs } from "../hooks/useJobs";

export default function JobsPage() {
  const { jobs, loading, error, reload } = useJobs();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");

  const filteredJobs = jobs.filter((job) => {
    const matchSearch = job.seniority_level.toLowerCase().includes(search.toLowerCase());

    const matchLevel = level ? job.seniority_level === level : true;

    return matchSearch && matchLevel;
  });
  if (loading) return <p>Loading jobs...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6">Find Your Dream Job</h1>

      <JobSearch search={search} setSearch={setSearch} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <JobFilters level={level} setLevel={setLevel} />

        <div className="lg:col-span-3 space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="text-gray-400">No jobs found</div>
          )}
        </div>
      </div>
    </div>
  );
}
