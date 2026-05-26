//src/features/applications/components/apply/QuestionCard.jsx
export default function QuestionCard({ question, value, onChange }) {
  return (
    <div className="border rounded-lg p-4 space-y-2 bg-white">
      <p className="font-medium">{question.question}</p>

      {question.type === "yes_no" && (
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              checked={value === "yes"}
              onChange={() => onChange("yes")}
            />
            <span className="ml-2">Yes</span>
          </label>

          <label>
            <input
              type="radio"
              checked={value === "no"}
              onChange={() => onChange("no")}
            />
            <span className="ml-2">No</span>
          </label>
        </div>
      )}

      {question.type === "text" && (
        <input
          className="w-full border p-2 rounded"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "textarea" && (
        <textarea
          className="w-full border p-2 rounded"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
