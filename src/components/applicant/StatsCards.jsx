// /components/applicant/StatsCards.jsx
const stats = [
  { label: "Applications", value: 12 },
  { label: "Interviews", value: 3 },
  { label: "Offers", value: 1 },
];

export default function StatsCards() {
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
