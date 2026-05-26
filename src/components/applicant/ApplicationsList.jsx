// /components/applicant/ApplicationsList.jsx
const applications = [
  {
    title: "Senior Backend Engineer",
    company: "Acme Inc.",
    status: "Async interview",
    due: "Due in 2 days",
    action: "Record 3 short answers - ~20 min",
    type: "interview",
  },
  {
    title: "Product Designer",
    company: "Northwind Labs",
    status: "Shortlisted",
    due: "No action needed",
    action: "Hiring manager will reach out by Friday",
    type: "shortlisted",
  },
  {
    title: "Growth Marketing Lead",
    company: "Lumen",
    status: "Test pending",
    due: "Due in 5 days",
    action: "Complete 20-min pattern test",
    type: "test",
  },
];

export default function ApplicationsList() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 text-lg">
          Active applications
        </h2>
        <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
          View all &gt;
        </button>
      </div>

      {applications.map((a, idx) => (
        <div
          key={idx}
          className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <h3 className="font-medium text-gray-800">{a.title}</h3>
              <p className="text-sm text-gray-500">
                {a.company} · {a.status}
              </p>
              <p className="text-xs text-gray-400 mt-1">{a.due}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.action}</p>
            </div>
            <button className="text-violet-600 text-sm font-medium border border-violet-200 px-3 py-1 rounded-full hover:bg-violet-50 transition-colors">
              Open &gt;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
