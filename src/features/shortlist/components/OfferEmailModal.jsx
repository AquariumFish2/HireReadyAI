import { useState } from "react";
import { X, Send, Loader2, Mail, User, FileText } from "lucide-react";

export default function OfferEmailModal({
  candidateName,
  candidateEmail,
  recruiterName,
  recruiterEmail,
  action,
  onClose,
  onSend,
  companyName = "",
}) {
  const isOffer = action === "offer";
  const [fromName, setFromName] = useState(recruiterName || "");
  const [fromEmail, setFromEmail] = useState(recruiterEmail || "");
  const [to, setTo] = useState(candidateEmail || "");
  const [subject, setSubject] = useState(
    isOffer ? `Opportunity at ${companyName || "[Company Name]"}` : "Update on Your Application"
  );
  const [body, setBody] = useState("");

  const fillTemplate = () => {
    if (isOffer) {
      setSubject(`Exciting Opportunity at ${companyName || "[Company Name]"}`);
      setBody(
        `Dear ${candidateName || "Candidate"},

I hope this message finds you well.

After reviewing your application and performance throughout our hiring process, we were truly impressed by your skills and experience. We believe you would be a great addition to our team at ${companyName || "[Company Name]"}.

We would love to schedule a conversation to discuss the next steps and explore how your expertise aligns with our goals. Please let us know your availability for a call or meeting at your earliest convenience.

We look forward to connecting with you!

Best regards,
${fromName || "[Your Name]"}`
      );
    } else {
      setSubject(`Update on Your Application — ${companyName || "[Company Name]"}`);
      setBody(
        `Dear ${candidateName || "Candidate"},

Thank you for your interest in joining ${companyName || "[Company Name]"} and for taking the time to go through our hiring process.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match the requirements of the role.

We appreciate your effort and wish you the very best in your future endeavors.

Sincerely,
${fromName || "[Your Name]"}`
      );
    }
  };
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !body || !fromEmail) return;
    setSending(true);
    try {
      await onSend({ fromName, fromEmail, to, subject, body });
      setSending(false);
    } catch {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cerulean-900">
          <div>
            <h2 className="text-lg font-bold text-deep-space-blue">
              {isOffer ? "Advance to Offer" : "Move to Rejected"}
            </h2>
            <p className="text-xs text-cerulean mt-0.5">
              Send an email to {candidateName || "the candidate"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cerulean hover:text-rich-cerulean hover:bg-sky-blue-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* From */}
          <div>
            <label className="block text-xs font-semibold text-cerulean uppercase tracking-wide mb-1.5">
              <User className="w-3 h-3 inline mr-1" />
              From
            </label>
            <div className="flex gap-2">
              <input
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Your name"
                className="w-1/3 rounded-xl px-3 py-2.5 text-sm text-deep-space-blue bg-sky-blue-900 border border-cerulean-900 outline-none focus:border-rich-cerulean transition placeholder:text-steel-blue"
              />
              <input
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-xl px-3 py-2.5 text-sm text-deep-space-blue bg-sky-blue-900 border border-cerulean-900 outline-none focus:border-rich-cerulean transition placeholder:text-steel-blue"
              />
            </div>
          </div>

          {/* To */}
          <div>
            <label className="block text-xs font-semibold text-cerulean uppercase tracking-wide mb-1.5">
              <Mail className="w-3 h-3 inline mr-1" />
              To
            </label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="candidate@email.com"
              className="w-full rounded-xl px-3 py-2.5 text-sm text-deep-space-blue bg-sky-blue-900 border border-cerulean-900 outline-none focus:border-rich-cerulean transition placeholder:text-steel-blue"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-cerulean uppercase tracking-wide mb-1.5">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full rounded-xl px-3 py-2.5 text-sm text-deep-space-blue bg-sky-blue-900 border border-cerulean-900 outline-none focus:border-rich-cerulean transition placeholder:text-steel-blue"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-cerulean uppercase tracking-wide">
                Message
              </label>
              <button
                onClick={fillTemplate}
                className="flex items-center gap-1 text-xs font-semibold text-rich-cerulean hover:text-yale-blue-600 transition"
              >
                <FileText className="w-3 h-3" />
                Use template
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                isOffer
                  ? "Write a professional offer letter...\n\nDear [Candidate Name],\n\nWe are pleased to offer you the position of..."
                  : "Write a professional rejection message..."
              }
              rows={8}
              className="w-full rounded-xl px-4 py-3 text-sm text-deep-space-blue bg-sky-blue-900 border border-cerulean-900 outline-none focus:border-rich-cerulean transition placeholder:text-steel-blue resize-none"
            />
          </div>

          {!isOffer && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              This will also mark the candidate as rejected.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-cerulean-900 bg-sky-blue-900 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-cerulean bg-white border border-cerulean-900 hover:bg-sky-blue-900 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !to || !subject || !body || !fromEmail}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-deep-space-blue hover:bg-yale-blue-600 transition disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                {isOffer ? "Send & Advance to Offer" : "Send & Reject"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
