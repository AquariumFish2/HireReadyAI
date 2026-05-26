// components/jobs/JobSearch.jsx
import Input from "@/shared/ui/input";

export default function JobSearch({ search, setSearch }) {
  return (
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search jobs..."
      className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
    />
  );
}
