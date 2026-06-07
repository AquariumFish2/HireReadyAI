//src\features\companies\components\job-postings\JobInfoGrid.jsx
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  BanknoteIcon,
  Calendar,
  TrendingUp,
  Monitor,
  MapPin,
  Wand2,
  User,
  ChevronRight,
  ExternalLink,
  Copy,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function JobInfoGrid({
  selectedJob,
  isEditing,
  editForm,
  setEditForm,
  company,
}) {
  const navigate = useNavigate();
  const clean = (str) => {
    if (!str) return str;
    return String(str)
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const { t } = useTranslation();
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-dark-amethyst-400"></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-dark-amethyst-500" />{" "}
            {t("job_info_grid.seniority_level")}
          </div>
          {isEditing ? (
            <input
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1"
              value={editForm.seniority_level || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, seniority_level: e.target.value })
              }
            />
          ) : (
            <p className="text-sm font-medium text-gray-900 capitalize">
              {clean(selectedJob.seniority_level) || "Engineering"}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5 text-red-400" />{" "}
            {t("job_info_grid.location")}
          </div>
          <p className="text-sm font-medium text-gray-900">
            {clean(company?.location) || t("job_filters.not_applicable")}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Monitor className="w-3.5 h-3.5 text-fuchsia-500" />{" "}
            {t("job_info_grid.work_type")}
          </div>
          {isEditing ? (
            <input
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1"
              value={editForm.work_location || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, work_location: e.target.value })
              }
            />
          ) : (
            <p className="text-sm font-medium text-gray-900 capitalize">
              {clean(selectedJob.work_location) || t("job_filters.remote")}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Briefcase className="w-3.5 h-3.5 text-orange-400" />{" "}
            {t("job_info_grid.type")}
          </div>
          {isEditing ? (
            <input
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1"
              value={editForm.job_type || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, job_type: e.target.value })
              }
            />
          ) : (
            <p className="text-sm font-medium text-gray-900 capitalize">
              {clean(selectedJob.job_type) || t("job_filters.full_time")}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <BanknoteIcon className="w-3.5 h-3.5 text-green-500" />{" "}
            {t("job_info_grid.salary")}
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1"
                value={editForm.salary_min || ""}
                placeholder={t("job_filters.min")}
                onChange={(e) =>
                  setEditForm({ ...editForm, salary_min: e.target.value })
                }
              />
              <span>-</span>
              <input
                type="number"
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1"
                value={editForm.salary_max || ""}
                placeholder={t("job_filters.max")}
                onChange={(e) =>
                  setEditForm({ ...editForm, salary_max: e.target.value })
                }
              />
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-900">
              {selectedJob.salary_min
                ? `$${selectedJob.salary_min.toLocaleString()}`
                : "N/A"}{" "}
              -{" "}
              {selectedJob.salary_max
                ? `$${selectedJob.salary_max.toLocaleString()}`
                : "N/A"}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" /> {t("job_info_grid.published")}
          </div>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(selectedJob.created_at)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Wand2 className="w-3.5 h-3.5 text-mauve-magic-500" />{" "}
            {t("job_info_grid.ai_shortlist")}
          </div>
          <p className="text-sm font-medium text-gray-900">
            {selectedJob.shortlist_entries?.[0]?.count || 0}{" "}
            {t("job_info_grid.strong_fits")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-gray-100">
        <button
          onClick={() =>
            navigate(
              `/recruiter/candidatespipline?jobId=${selectedJob.id}&companyId=${company?.id}`,
            )
          }
          className="flex items-center gap-2 bg-dark-amethyst-600 hover:bg-dark-amethyst-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <User className="w-4 h-4" />
          {t("job_info_grid.open_candidate_board")}{" "}
          <ChevronRight className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors">
          <ExternalLink className="w-4 h-4" />
          {t("job_info_grid.view_public_posting")}
        </button>
        <button className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors">
          <Copy className="w-4 h-4" />
          {t("job_info_grid.copy_link")}
        </button>
      </div>
    </div>
  );
}
