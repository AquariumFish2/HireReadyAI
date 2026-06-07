//src\features\interview\components\TextQuestion.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";

const MIN_LENGTH = 30;

export default function TextQuestion({ question, onAnswer }) {
  const [value, setValue] = useState("");
  const tooShort = value.trim().length < MIN_LENGTH;
  const { t } = useTranslation();
  const handleSubmit = () => {
    if (tooShort) return;
    onAnswer(value.trim());
  };

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your answer here…"
        rows={7}
        className="w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none transition"
      />

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${tooShort ? "text-muted-foreground" : "text-success"}`}
        >
          {value.trim().length} chars{tooShort ? ` (min ${MIN_LENGTH})` : " ✓"}
        </span>
        <button
          onClick={handleSubmit}
          disabled={tooShort}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("code_question.submit_answer")} →
        </button>
      </div>
    </div>
  );
}
