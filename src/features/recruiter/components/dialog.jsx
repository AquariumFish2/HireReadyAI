//src\features\recruiter\components\dialog.jsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { TextareaField } from "./textArea";
import { useTranslation } from "react-i18next";
import InterviewQuestion from "@/features/interview/models/interview-question.model";

export function AddInterviewDialog() {
  const { t } = useTranslation();
  const [applicationID, setApplicationID] = useState("");
  const [jobID, setJobID] = useState("");
  const [reRecordMins, setReRecordMins] = useState(0);
  const [error, setError] = useState("");
  const [questionsText, setQuestionsText] = useState("");
  const [questionsList, setQuestionList] = useState([]);
  const [loading, setLoading] = useState(false);

  async function submitInterview(e) {
    e.preventDefault();
    if (!applicationID || !jobID) {
      setError(t("add_interview.errors.required_ids"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const array = questionsText
        .split(/\r?\n/)
        .filter((q) => q.trim() !== "")
        .map((q) => q.trim());
      setQuestionList(array);

      // Legacy: Interview creation moved to application stages
      console.warn("AddInterviewDialog is obsolete in new stage-based schema");
    } catch (err) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{t("add_interview.buttons.open")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={submitInterview}>
          <DialogHeader>
            <DialogTitle>{t("add_interview.title")}</DialogTitle>
            <DialogDescription>
              {t("add_interview.description")}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="application-id">
                {t("add_interview.labels.application_id")}
              </Label>
              <Input
                id="applicant-id"
                name="applicant-id"
                onChange={(e) => {
                  setApplicationID(e.target.value);
                }}
              />
            </Field>
            <Field>
              <Label htmlFor="job-id">{t("add_interview.labels.job_id")}</Label>
              <Input
                id="job-id"
                name="job-id"
                onChange={(e) => setJobID(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="rerecord-input">
                {t("add_interview.labels.rerecord_after")}{" "}
              </Label>
              <Input
                id="rerecord-input"
                name="rerecord-input"
                type="number"
                className="no-spinner"
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value < 0) {
                    setError(t("add_interview.errors.rerecord_positive"));
                  } else {
                    setError("");
                    setReRecordMins(value);
                  }
                }}
              />
              {error && <p className="italic text-red-400 text-sm">{error}</p>}
            </Field>
            <Field>
              <TextareaField
                value={questionsText}
                onChange={(e) => {
                  setQuestionsText(e.target.value);
                }}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("avatar_modal.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading
                ? t("add_interview.buttons.sending")
                : t("add_interview.buttons.send")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
