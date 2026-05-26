import JobCard from "./JobCard";
import jobs from "../../data/jobs.mock";

export default function JobsList() {
  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
