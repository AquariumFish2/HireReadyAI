// src\features\recruiter\components\textArea.jsx
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

export function TextareaField({ value, onChange }) {
  const { t } = useTranslation();

  return (
    <Field>
      <FieldLabel htmlFor="textarea-message">
        {t("apply_job.steps.questions")}
      </FieldLabel>
      <FieldDescription>{t("add_interview.enter_question")}</FieldDescription>
      <Textarea
        id="textarea-message"
        placeholder="Question 1&#10;Question 2&#10;Question 3"
        value={value}
        onChange={onChange}
      />
    </Field>
  );
}
