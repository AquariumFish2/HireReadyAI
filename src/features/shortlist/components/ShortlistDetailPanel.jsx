//src\features\shortlist\components\ShortlistDetailPanel.jsx
import { useState, useRef, useEffect } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
  X,
  ChevronUp,
  Send,
  Clock,
  UserCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function getAvatarColor(name = "") {
  const colors = [
    "bg-violet-500",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-fuchsia-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
function timeAgo(dateString) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return t("shortlist.timeAgo.days", { count: days });
  if (hours > 0) return t("shortlist.timeAgo.hours", { count: hours });
  return t("shortlist.timeAgo.justNow");
}

const TAG_COLORS = {
  "Strong Fit": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Leaning hire": "bg-sky-50 text-sky-700 border-sky-200",
  "Needs Review": "bg-amber-50 text-amber-700 border-amber-200",
};

const VOTE_CONFIG = {
  up: {
    label: "Up",
    Icon: ThumbsUp,
    active: "bg-emerald-500 text-white",
    inactive:
      "bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600",
  },
  neutral: {
    label: "Neutral",
    Icon: Minus,
    active: "bg-gray-500 text-white",
    inactive: "bg-gray-100 text-gray-500 hover:bg-gray-200",
  },
  down: {
    label: "Down",
    Icon: ThumbsDown,
    active: "bg-red-500 text-white",
    inactive: "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500",
  },
};

export default function ShortlistDetailPanel({
  entry,
  myVote,
  notes,
  notesLoading,
  onClose,
  onCastVote,
  onReject,
  onAdvanceToOffer,
  onPostNote,
  isOverlay,
}) {
  const { t } = useTranslation();
  const [noteBody, setNoteBody] = useState("");
  const [visibleToTeam, setVisibleToTeam] = useState(true);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [postingNote, setPostingNote] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const notesEndRef = useRef(null);

  const { applications: app, tags = [] } = entry;
  const {
    profiles: candidate,
    shortlist_votes: votes = [],
    composite_score,
    ai_rationale,
    ai_confidence,
    is_rejected,
    rejection_reason,
  } = app;

  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  const upVotes = votes.filter((v) => v.vote === "up").length;
  const totalVoters = votes.length;

  const handlePostNote = async () => {
    if (!noteBody.trim()) return;
    setPostingNote(true);
    await onPostNote(noteBody.trim(), visibleToTeam);
    setNoteBody("");
    setPostingNote(false);
  };

  const handleReject = async () => {
    setRejecting(true);
    await onReject(app.id, rejectReason.trim());
    setRejecting(false);
    setShowRejectInput(false);
  };

  return (
    <>
      {/* Backdrop on overlay mode */}
      {isOverlay && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-100"
          onClick={onClose}
        />
      )}

      <div
        className={`bg-white flex flex-col overflow-hidden border-l border-gray-100 ${
          isOverlay
            ? "fixed right-0 top-0 bottom-0 z-110 w-[380px] shadow-2xl"
            : "w-[380px] shrink-0 h-full"
        }`}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${getAvatarColor(candidate?.full_name)}`}
              >
                {getInitials(candidate?.full_name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">
                    {candidate?.full_name}
                  </span>
                  {composite_score != null && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        composite_score >= 80
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : composite_score >= 65
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {composite_score}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {candidate?.headline || candidate?.role}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${TAG_COLORS[tag] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* YOUR VOTE */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">
              {t("shortlist.yourVote")}
            </p>
            {myVote ? (
              <div
                className={`rounded-lg px-4 py-3 text-sm font-medium mb-3 ${
                  myVote === "up"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : myVote === "down"
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                }`}
              >
                {t("shortlist.votedMessage", { vote: myVote })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-3">
                {t("shortlist.noVoteYet")}
              </p>
            )}
            <div className="flex gap-2">
              {Object.entries(VOTE_CONFIG).map(
                ([value, { label, Icon, active, inactive }]) => (
                  <button
                    key={value}
                    onClick={() =>
                      onCastVote(app.id, myVote === value ? null : value)
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${myVote === value ? active : inactive}`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* TEAM VOTES */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                {t("shortlist.teamVotes")}
              </p>
              <span className="text-xs text-gray-500">
                {t("shortlist.votesCast", { count: totalVoters })}
              </span>
            </div>
            {totalVoters > 0 && (
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-emerald-400 transition-all"
                  style={{
                    width: `${(upVotes / Math.max(totalVoters, 1)) * 100}%`,
                  }}
                />
              </div>
            )}
            <div className="space-y-2">
              {votes.map((v, i) => (
                <div
                  key={v.id || i}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${getAvatarColor(v.profiles?.full_name)}`}
                    >
                      {getInitials(v.profiles?.full_name)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800">
                        {v.profiles?.full_name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {v.profiles?.headline || v.profiles?.role}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      v.vote === "up"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : v.vote === "down"
                          ? "bg-red-50 text-red-500 border border-red-200"
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {v.vote === "up"
                      ? t("shortlist.vote.up")
                      : v.vote === "down"
                        ? t("shortlist.vote.down")
                        : t("shortlist.vote.neutral")}
                  </span>
                </div>
              ))}
              {votes.length === 0 && (
                <p className="text-xs text-gray-400">
                  {t("shortlist.noVotes")}
                </p>
              )}
            </div>
          </div>

          {/* AI RATIONALE */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="bg-mauve-magic-50 border border-mauve-magic-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-mauve-magic-500" />
                  <p className="text-[10px] font-bold tracking-widest uppercase text-mauve-magic-600">
                    {t("shortlist.aiRationale")}
                  </p>
                </div>
                {ai_confidence != null && (
                  <span className="text-[10px] font-bold text-mauve-magic-700 bg-mauve-magic-100 px-2 py-0.5 rounded-full">
                    {t("shortlist.confidence", {
                      value: Math.round(ai_confidence * 100),
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {ai_rationale || t("shortlist.noAiRationale")}
              </p>
              {!is_rejected && (
                <button className="mt-3 text-xs font-semibold text-mauve-magic-600 hover:text-mauve-magic-800 transition-colors">
                  {t("shortlist.proceedNext")}
                </button>
              )}
            </div>
          </div>

          {/* TEAM NOTES */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">
              {t("shortlist.teamNotes")}
            </p>
            {notesLoading ? (
              <div className="text-xs text-gray-400">
                {t("shortlist.loadingNotes")}
              </div>
            ) : (
              <div className="space-y-3 mb-3">
                {notes.length === 0 && (
                  <p className="text-xs text-gray-400">
                    {t("shortlist.noNotes")}
                  </p>
                )}
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-800">
                        {note.profiles?.full_name || t("shortlist.teamMember")}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        {timeAgo(note.created_at)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {note.body}
                    </p>
                  </div>
                ))}
                <div ref={notesEndRef} />
              </div>
            )}
            <textarea
              rows={2}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder={t("shortlist.notePlaceholder")}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400 text-gray-700 placeholder-gray-400"
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleToTeam}
                  onChange={(e) => setVisibleToTeam(e.target.checked)}
                  className="accent-dark-amethyst-500"
                />
                <UserCheck className="w-3 h-3" />
                {t("shortlist.visibleToTeam")}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNoteBody("")}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {t("shortlist.cancel")}
                </button>
                <button
                  onClick={handlePostNote}
                  disabled={!noteBody.trim() || postingNote}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-dark-amethyst-600 hover:bg-dark-amethyst-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  {postingNote
                    ? t("shortlist.posting")
                    : t("shortlist.postNote")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        {!is_rejected ? (
          <div className="px-5 py-4 border-t border-gray-100 bg-white shrink-0 space-y-2">
            {showRejectInput ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">
                  {t("shortlist.rejectionReason")}
                </p>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs border border-red-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-300 text-gray-700"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {t("shortlist.cancel")}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={rejecting}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {rejecting
                      ? t("shortlist.rejecting")
                      : t("shortlist.confirmReject")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => onAdvanceToOffer(app.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-linear-to-r from-dark-amethyst-600 to-mauve-magic-600 hover:from-dark-amethyst-700 hover:to-mauve-magic-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                  <ChevronUp className="w-4 h-4" />
                  Advance to offer
                </button>
                <button
                  onClick={() => {
                    setShowRejectInput(true);
                    if (!rejectReason && ai_rationale)
                      setRejectReason(ai_rationale);
                  }}
                  className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  {t("shortlist.moveRejected")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="px-5 py-4 border-t border-gray-100 bg-red-50 shrink-0">
            <p className="text-xs text-red-500 font-semibold mb-1">
              {t("shortlist.rejected")}
            </p>
            {rejection_reason && (
              <p className="text-xs text-gray-500 leading-relaxed">
                {rejection_reason}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
