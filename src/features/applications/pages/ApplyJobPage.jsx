// src/features/applications/pages/ApplyJobPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { fetchQuestionsByJobId } from "../services/application.service";
import { createApplication } from "../services/application.service";
import { triggerCvReview } from "../services/cv-review.service";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
import { supabase } from "@/shared/services/supabase";
import QuestionCard from "../components/apply/QuestionCard";

export default function ApplyJobPage() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUser();

  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    resume: null,
    answers: {},
  });

  const steps = ["Info", "Resume", "Questions"];
  const progress = ((step + 1) / steps.length) * 100;
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast]);
  const clearFieldError = (field) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validateStep = () => {
    const stepErrors = {};

    if (step === 0) {
      if (!form.fullName.trim()) {
        stepErrors.fullName = "Full name is required";
      }

      if (!form.email.trim()) {
        stepErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        stepErrors.email = "Invalid email format";
      }

      if (!form.phone.trim()) {
        stepErrors.phone = "Phone is required";
      } else if (form.phone.length < 10) {
        stepErrors.phone = "Invalid phone number";
      }
    }

    if (step === 1 && !form.resume) {
      stepErrors.resume = "Resume is required";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // FETCH QUESTIONS FROM SUPABASE
  useEffect(() => {
    if (!jobId) return;

    const loadQuestions = async () => {
      try {
        const data = await fetchQuestionsByJobId(jobId);
        setQuestions(data);
      } catch (err) {
        console.error("Error loading questions:", err);
      }
    };

    loadQuestions();
  }, [jobId]);

  // ANSWERS HANDLER
  const handleAnswer = (id, value) => {
    setForm((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [id]: value,
      },
    }));

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[`question_${id}`];
      return copy;
    });
  };

  // UPLOAD RESUME
  const uploadResume = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("resumes")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage.from("resumes").getPublicUrl(fileName);

    return data.publicUrl;
  };

  const validateForm = () => {
    const newErrors = {};

    // INFO
    if (!form.fullName.trim()) newErrors.fullName = "This field can't be empty";

    if (!form.email.trim()) newErrors.email = "This field can't be empty";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email";

    if (!form.phone.trim()) newErrors.phone = "This field can't be empty";
    else if (form.phone.length < 10)
      newErrors.phone = "Please enter a valid phone number";

    // RESUME
    if (!form.resume) newErrors.resume = "Resume is required";
    else {
      if (form.resume.type !== "application/pdf")
        newErrors.resume = "Only PDF files are allowed";

      if (form.resume.size > 5 * 1024 * 1024)
        newErrors.resume = "Maximum file size is 5MB";
    }

    // QUESTIONS
    questions.forEach((q) => {
      if (!form.answers[q.id]) {
        newErrors[`question_${q.id}`] = "This field can't be empty";
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        setToast({
          type: "error",
          message: "Please complete all required fields",
        });
        return;
      }

      setLoading(true);

      let cvUrl = null;
      let cvName = null;

      let cvText = "";

      if (form.resume) {
        const file = form.resume;

        cvUrl = await uploadResume(file);
        cvName = file.name;

        // Extract text client-side
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer })
            .promise;
          for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item) => item.str)
              .join(" ");
            cvText += pageText + "\n";
          }
        } catch (extractErr) {
          console.error("Client-side PDF extraction failed:", extractErr);
          // If we fail to extract, we still let the application go through
        }
      }
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_profile_id", profile.id)
        .eq("job_id", jobId)
        .maybeSingle();

      if (existing) {
        setToast({
          type: "error",
          message: "You have already applied for this job",
        });

        return;
      }
      const payload = {
        candidate_profile_id: profile.id,
        job_id: jobId,
        cv_file_url: cvUrl,
        cv_file_name: cvName,
        answers: {
          info: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
          },
          questions: form.answers,
        },
        current_stage: "applied",
        applied_at: new Date().toISOString(),
      };

      const application = await createApplication(payload);

      // Fire and forget CV review
      triggerCvReview(application.id, cvText.trim());

      setToast({
        type: "success",
        message: "Application submitted successfully!",
      });

      setTimeout(() => {
        navigate("/jobs");
      }, 2000);
    } catch (err) {
      console.error("❌ Submit error:", err);
      setToast({
        type: "error",
        message: "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`px-4 py-3 rounded-xl shadow-md text-sm font-medium border
            ${
              toast.type === "success"
                ? "bg-dark-amethyst-50 text-dark-amethyst-700 border-dark-amethyst-100"
                : "bg-red-50 text-red-600 border-red-200"
            }
          `}
          >
            {toast.type === "success" ? "✅" : "❌"} {toast.message}
          </div>
        </div>
      )}

      {/* PAGE WRAPPER */}
      <div className="min-h-screen bg-dark-amethyst-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl bg-white rounded-2xl border border-dark-amethyst-100 shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="p-6 border-b border-dark-amethyst-100 bg-white">
            <h1 className="text-2xl font-bold text-dark-amethyst-950">
              Apply for Job
            </h1>

            {/* STEPS */}
            <div className="mt-5 flex justify-between text-xs">
              {steps.map((s, i) => (
                <span
                  key={i}
                  className={`font-medium transition ${
                    i <= step
                      ? "text-dark-amethyst-700"
                      : "text-dark-amethyst-400"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>

            {/* PROGRESS */}
            <div className="w-full h-2 bg-dark-amethyst-50 rounded-full mt-3 overflow-hidden border border-dark-amethyst-100">
              <div
                className="h-2 bg-dark-amethyst-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-5">
            {/* STEP 1 */}
            {step === 0 && (
              <div className="space-y-5">
                {/* FULL NAME */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-dark-amethyst-600 mb-2">
                    Full Name *
                  </label>

                  <input
                    value={form.fullName || ""}
                    className={`w-full h-11 rounded-xl px-4 text-sm bg-dark-amethyst-50 border outline-none transition
                    ${
                      errors.fullName
                        ? "border-red-400"
                        : "border-dark-amethyst-100 focus:border-[#8400ff]"
                    }`}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }));
                      if (errors.fullName) clearFieldError("fullName");
                    }}
                  />

                  {errors.fullName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-dark-amethyst-600 mb-2">
                    Email *
                  </label>

                  <input
                    value={form.email || ""}
                    className={`w-full h-11 rounded-xl px-4 text-sm bg-dark-amethyst-50 border outline-none transition
                    ${
                      errors.email
                        ? "border-red-400"
                        : "border-dark-amethyst-100 focus:border-[#8400ff]"
                    }`}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                      if (errors.email) clearFieldError("email");
                    }}
                  />

                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-dark-amethyst-600 mb-2">
                    Phone *
                  </label>

                  <input
                    value={form.phone || ""}
                    className={`w-full h-11 rounded-xl px-4 text-sm bg-dark-amethyst-50 border outline-none transition
                    ${
                      errors.phone
                        ? "border-red-400"
                        : "border-dark-amethyst-100 focus:border-[#8400ff]"
                    }`}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }));
                      if (errors.phone) clearFieldError("phone");
                    }}
                  />

                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-dark-amethyst-600 mb-3">
                  Resume *
                </label>

                <label
                  className={`block border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition
                  ${
                    errors.resume
                      ? "border-red-400 bg-red-50"
                      : "border-dark-amethyst-200 bg-dark-amethyst-50 hover:border-dark-amethyst-400"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        resume: e.target.files[0],
                      }));
                      if (errors.resume) clearFieldError("resume");
                    }}
                  />

                  <p className="text-sm text-dark-amethyst-700 font-medium">
                    {form.resume ? form.resume.name : "Upload Resume (PDF)"}
                  </p>

                  <p className="text-xs text-dark-amethyst-400 mt-2">
                    Drag & drop or click to upload
                  </p>
                </label>

                {errors.resume && (
                  <p className="text-xs text-red-500 mt-2">{errors.resume}</p>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <div className="space-y-4 bg-dark-amethyst-50 p-4 rounded-2xl border border-dark-amethyst-100">
                {questions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    value={form.answers[q.id]}
                    error={errors[`question_${q.id}`]}
                    onChange={(val) => handleAnswer(q.id, val)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-5 border-t border-dark-amethyst-100 flex justify-between bg-white">
            {step > 0 ? (
              <button
                className="px-4 py-2 rounded-xl border border-dark-amethyst-200 text-dark-amethyst-600 hover:bg-dark-amethyst-50 transition text-sm"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                className="px-5 py-2 rounded-xl bg-dark-amethyst-600 text-white text-sm font-semibold hover:bg-dark-amethyst-700 transition"
                onClick={() => {
                  const isValid = validateStep();
                  if (!isValid) {
                    setToast({
                      type: "error",
                      message: "Please fix errors before continuing",
                    });
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-dark-amethyst-600 text-white text-sm font-semibold hover:bg-dark-amethyst-700 transition disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
