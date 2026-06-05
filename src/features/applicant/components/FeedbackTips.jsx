// /components/applicant/FeedbackTips.jsx

export default function FeedbackTips() {
  return (
    <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7 shadow-sm space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-dark-amethyst-950">
          Feedback & tips
        </h2>

        <p className="text-sm text-dark-amethyst-500 mt-1">
          From your last submission
        </p>
      </div>

      {/* Insight Card 1 */}
      <div className="p-4 rounded-xl border border-dark-amethyst-100 bg-dark-amethyst-50">
        <div className="flex items-center gap-2">
          <span className="text-dark-amethyst-700 text-sm font-semibold">
            87%
          </span>

          <span className="text-sm font-medium text-dark-amethyst-800">
            Strong pattern recognition
          </span>
        </div>

        <p className="text-xs text-dark-amethyst-500 mt-1">
          You scored in the top 15% for logical sequences.
        </p>
      </div>

      {/* Insight Card 2 */}
      <div className="p-4 rounded-xl border border-dark-amethyst-100 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-dark-amethyst-600 text-sm font-semibold">
            Pacing
          </span>

          <span className="text-sm font-medium text-dark-amethyst-800">
            could improve
          </span>
        </div>

        <p className="text-xs text-dark-amethyst-500 mt-1">
          Try not to spend more than 90s per question on the next test.
        </p>
      </div>
    </div>
  );
}
