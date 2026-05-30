import { useParams, useNavigate } from "react-router-dom";
import { useJobs } from "../hooks/useJobs";

export default function JobDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { jobs, loading } = useJobs();

  if (loading) return <p>Loading...</p>;

  const job = jobs?.find((j) => j.id === id);

  if (!job) return <p>Job not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* MAIN CARD */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden">
        {/* HEADER SECTION */}
        <div className="p-8 border-b bg-gradient-to-r from-violet-50 to-white">
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>

          <p className="mt-2 text-gray-600">
            {job.seniority_level.toUpperCase()} •{" "}
            {job.job_type.toUpperCase().replace("_", " ")}
          </p>

          {/* ACTIONS */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate("apply")}
              className="
                px-5 py-2.5 rounded-lg
                bg-violet-600 text-white
                font-medium
                hover:bg-violet-700
                transition
                shadow-sm hover:shadow-md
              "
            >
              Easy Apply
            </button>

            <button
              className="
                px-5 py-2.5 rounded-lg
                border border-gray-300
                text-gray-700
                hover:bg-gray-100
                transition
              "
            >
              Save Job
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-10">
          {/* ABOUT */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              About the job
            </h2>
            <p className="text-gray-600 leading-relaxed">{job.description}</p>
          </section>

          {/* RESPONSIBILITIES */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Responsibilities
            </h2>
            <ul className="space-y-2 text-gray-600 list-disc pl-5">
              <li>Develop responsive UI components</li>
              <li>Work with backend APIs</li>
              <li>Collaborate with designers</li>
            </ul>
          </section>

          {/* REQUIREMENTS */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Requirements
            </h2>
            <ul className="space-y-2 text-gray-600 list-disc pl-5">
              <li>Strong HTML, CSS, JS</li>
              <li>React experience</li>
              <li>Git knowledge</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
