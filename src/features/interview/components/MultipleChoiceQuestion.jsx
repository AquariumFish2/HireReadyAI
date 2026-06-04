import { useState } from "react";

export default function MultipleChoiceQuestion({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const options = question?.options ?? [];

  const handleSubmit = () => {
    if (selected === null) return;
    onAnswer(selected);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          const isSelected = selected === opt;
          return (
            <button
              key={idx}
              onClick={() => setSelected(opt)}
              className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-all flex items-start gap-3 ${
                isSelected
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-background hover:bg-secondary hover:border-primary/30 text-foreground"
              }`}
            >
              <span
                className={`flex-none size-6 rounded-md text-xs font-semibold flex items-center justify-center mt-0.5 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {letter}
              </span>
              <span className="leading-snug">{opt}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit Answer →
        </button>
      </div>
    </div>
  );
}
