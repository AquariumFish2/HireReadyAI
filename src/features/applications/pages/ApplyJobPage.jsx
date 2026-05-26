// src/features/applications/pages/ApplyJobPage.jsx
import { useState } from "react";
import { screeningQuestions } from "../data/screeningQuestions";
import QuestionCard from "../components/apply/QuestionCard";

export default function ApplyJobPage() {
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    resume: null,
    answers: {},
    salary: "",
    noticePeriod: "",
  });

  const steps = ["Info", "Resume", "Questions"];

  const progress = ((step + 1) / steps.length) * 100;

  const handleAnswer = (id, value) => {
    setForm((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [id]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      {/* MAIN CARD */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border overflow-hidden">
        {/* HEADER + PROGRESS */}
        <div className="p-6 border-b bg-white">
          <h1 className="text-xl font-semibold text-gray-900">
            Apply for Frontend Developer
          </h1>

          {/* Steps */}
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            {steps.map((s, i) => (
              <span
                key={i}
                className={
                  i <= step ? "text-violet-600 font-medium" : "text-gray-400"
                }
              >
                {s}
              </span>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
            <div
              className="bg-violet-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* BODY */}
        <div className="p-6">
          {/* STEP 1 - INFO */}
          {step === 0 && (
            <div className="space-y-4">
              <input
                placeholder="Full Name"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />

              <input
                placeholder="Email"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                placeholder="Phone"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          )}

          {/* STEP 2 - RESUME */}

          {step === 1 && (
            <div className="space-y-4">
              <label
                className={`
        block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition
        ${form.resume ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-violet-500"}
      `}
              >
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setForm({ ...form, resume: file });
                  }}
                />

                {!form.resume ? (
                  <>
                    <p className="text-gray-600 font-medium">
                      Drag & drop your resume or click to upload
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      PDF, DOC up to 2MB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-green-700 font-medium">
                      Resume uploaded successfully ✅
                    </p>

                    <p className="text-sm text-gray-600 mt-2">
                      {form.resume.name}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      Click to replace file
                    </p>
                  </>
                )}
              </label>
            </div>
          )}

          {/* STEP 3 - QUESTIONS */}
          {step === 2 && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
              {screeningQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  value={form.answers[q.id]}
                  onChange={(val) => handleAnswer(q.id, val)}
                />
              ))}
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-5 border-t flex justify-between bg-white sticky bottom-0">
          {/* BACK */}
          {step > 0 ? (
            <button
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {/* NEXT / SUBMIT */}
          {step < 2 ? (
            <button
              className="px-5 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition shadow-sm"
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          ) : (
            <button className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm">
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
