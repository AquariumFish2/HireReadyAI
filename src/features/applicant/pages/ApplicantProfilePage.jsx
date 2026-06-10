import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Mail, Phone, MapPin, Globe, ExternalLink,
  Briefcase, GraduationCap, Wrench, Languages,
  FolderGit2, HeartHandshake, BadgeCheck,
  User, BookOpen, Pencil, X, Check, Plus, Trash2, Upload, Star,
} from "lucide-react";
import { useUser } from "@/features/auth/context/user.context";
import { fetchApplicantProfile, updateApplicantProfile } from "../services/profile.service";
import { addExperience, updateExperience, deleteExperience } from "../services/experience.service";
import { addEducation, updateEducation, deleteEducation } from "../services/education.service";
import { addSkill, updateSkill, deleteSkill } from "../services/skills.service";
import { addLanguage, updateLanguage, deleteLanguage } from "../services/languages.service";
import { addCertificate, updateCertificate, deleteCertificate } from "../services/certificates.service";
import { addProject, updateProject, deleteProject } from "../services/projects.service";
import { addVolunteering, updateVolunteering, deleteVolunteering } from "../services/volunteering.service";
import { uploadFile, deleteFile } from "@/shared/services/upload.service";
import AvatarModal from "../components/AvatarModal";
import ItemDialog from "../components/ItemDialog";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import {
  Experience,
  Education,
  Skill,
  Language,
  Certificate,
  Project,
  Volunteering,
} from "../models";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDateRange(from, to) {
  const parts = [];
  if (from) {
    const [y, m] = from.split("-");
    parts.push(`${MONTHS[parseInt(m) - 1] || ""} ${y}`);
  }
  parts.push(to && to !== "present" ? (() => {
    const [y, m] = to.split("-");
    return `${MONTHS[parseInt(m) - 1] || ""} ${y}`;
  })() : "Present");
  return parts.join(" – ");
}

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function SectionCard({ icon: Icon, title, children, className = "" }) {
  return (
    <div className={`bg-background rounded-xl border border-border/60 p-5 shadow-xs ${className}`}>
      <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary/60" />}
        {title}
      </h2>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, multiline = false, placeholder = "", type = "text" }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>}
      {multiline ? (
        <textarea
          className="w-full text-sm bg-background border border-border/70 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all min-h-[80px] resize-y"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className="w-full text-sm bg-background border border-border/70 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return <p className="text-sm text-muted-foreground/60 italic">{message}</p>;
}

function ImageUpload({ bucket, currentUrls = [], onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, bucket);
      onUploaded(url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {currentUrls.map((url, i) => (
          <div key={i} className="relative group">
            <img src={url} alt="" className="w-20 h-16 rounded-lg object-cover border border-border/60" />
            <button
              type="button"
              onClick={() => { deleteFile(url, bucket); onUploaded(null, i); }}
              className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>
      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/60 rounded-md cursor-pointer hover:bg-secondary/50 transition-colors">
        <Upload className="w-3 h-3" />
        {uploading ? "Uploading..." : "Upload image"}
        <input type="file" hidden accept="image/*" onChange={(e) => handleFile(e.target.files[0])} disabled={uploading} />
      </label>
    </div>
  );
}

const DEGREE_LEVELS = [
  "High School", "Associate's", "Bachelor's", "Master's",
  "Doctorate (PhD)", "MBA", "JD (Law)", "MD (Medicine)",
  "Professional Certificate", "Diploma", "Other",
];

const SKILL_LABELS = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];
const LANG_LABELS = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Native Speaker"];

function StarRatingInput({ value, onChange, labels }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Proficiency</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-0.5 transition-colors ${star <= (value || 0) ? "text-amber-400" : "text-muted-foreground/20"}`}
          >
            <Star className={`w-5 h-5 ${star <= (value || 0) ? "fill-amber-400" : ""}`} />
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-xs text-muted-foreground mt-1">{value} – {labels?.[value] || ""}</p>
      )}
    </div>
  );
}

function StarRatingDisplay({ level, labels }) {
  const val = parseInt(level, 10);
  if (!val || val < 1 || val > 5) return <span className="text-muted-foreground">· {level}</span>;
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3 h-3 ${s <= val ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`} />
      ))}
      <span className="text-[10px] text-muted-foreground ml-1">{labels?.[val] || ""}</span>
    </span>
  );
}

function ImageLightbox({ src, alt, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-10">
        <X className="w-6 h-6" />
      </button>
      <img src={src} alt={alt || ""} className="relative max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

const SECTION_MODEL = {
  experience: Experience,
  education: Education,
  skills: Skill,
  languages: Language,
  certificates: Certificate,
  projects: Project,
  volunteering: Volunteering,
};

const SECTION_ADD = {
  experience: addExperience,
  education: addEducation,
  skills: addSkill,
  languages: addLanguage,
  certificates: addCertificate,
  projects: addProject,
  volunteering: addVolunteering,
};

const SECTION_UPDATE = {
  experience: updateExperience,
  education: updateEducation,
  skills: updateSkill,
  languages: updateLanguage,
  certificates: updateCertificate,
  projects: updateProject,
  volunteering: updateVolunteering,
};

const SECTION_DELETE = {
  experience: deleteExperience,
  education: deleteEducation,
  skills: deleteSkill,
  languages: deleteLanguage,
  certificates: deleteCertificate,
  projects: deleteProject,
  volunteering: deleteVolunteering,
};

export default function ApplicantProfilePage() {
  const { id } = useParams();
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [editBasic, setEditBasic] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [savingBasic, setSavingBasic] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [dialog, setDialog] = useState(null); // { section, index(optional), data }
  const [savingDialog, setSavingDialog] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const viewingOwn = !id || id === user?.id;
  const fetchId = id || user?.id;

  async function loadProfile() {
    if (!fetchId) return;
    setLoading(true);
    try {
      const data = await fetchApplicantProfile(fetchId);
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [fetchId]);

  const handleSaveBasic = async () => {
    setSavingBasic(true);
    try {
      await updateApplicantProfile(fetchId, {
        full_name: profile.full_name,
        headline: profile.headline,
        phone: profile.phone,
        location: profile.location,
        linkedin_url: profile.linkedin_url,
      });
      setEditBasic(false);
    } catch (err) {
      console.error("Failed to save basic info:", err);
    } finally {
      setSavingBasic(false);
    }
  };

  const handleCancelBasic = () => {
    setEditBasic(false);
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      await updateApplicantProfile(fetchId, { bio: profile.bio });
      setEditBio(false);
    } catch (err) {
      console.error("Failed to save bio:", err);
    } finally {
      setSavingBio(false);
    }
  };

  const handleCancelBio = () => {
    setEditBio(false);
  };

  const handleAvatarChange = (url) => {
    setProfile((prev) => ({ ...prev, profile_pic: url }));
  };

  const handleOpenAdd = (section) => {
    setDialog({ section, index: null, data: {} });
  };

  const handleOpenEdit = (section, index) => {
    const items = profile[section] || [];
    setDialog({ section, index, data: { ...items[index] } });
  };

  const handleCloseDialog = () => {
    setDialog(null);
    setSavingDialog(false);
  };

  const handleDialogChange = (key, value) => {
    setDialog((prev) => ({ ...prev, data: { ...prev.data, [key]: value } }));
  };

  const handleSaveDialog = async () => {
    if (!dialog) return;
    setSavingDialog(true);
    try {
      const { section, index, data } = dialog;
      if (index == null) {
        const Model = SECTION_MODEL[section];
        const item = Model ? Model.fromJson(data) : data;
        await SECTION_ADD[section](fetchId, item instanceof Model ? item.toJson() : item);
      } else {
        const Model = SECTION_MODEL[section];
        const item = Model ? Model.fromJson(data) : data;
        await SECTION_UPDATE[section](fetchId, index, item instanceof Model ? item.toJson() : item);
      }
      handleCloseDialog();
      await loadProfile();
    } catch (err) {
      console.error("Failed to save dialog:", err);
    } finally {
      setSavingDialog(false);
    }
  };

  const handleDeleteItem = async (section, index) => {
    try {
      await SECTION_DELETE[section](fetchId, index);
      await loadProfile();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;
  if (!profile) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center p-5">
        <div className="text-center">
          <User className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const isOwn = viewingOwn && user?.id === fetchId;

  return (
    <div className="min-h-screen bg-surface-muted font-sans text-foreground">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0 cursor-pointer" onClick={() => isOwn && setAvatarOpen(true)}>
              {profile.profile_pic ? (
                <img src={profile.profile_pic} alt={profile.full_name} className="w-16 h-16 rounded-full object-cover border-[3px] border-border/60" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 border-[3px] border-border/60 flex items-center justify-center text-lg font-bold text-primary">
                  {getInitials(profile.full_name)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{profile.full_name}</h1>
              {profile.headline && <p className="text-sm text-muted-foreground mt-0.5">{profile.headline}</p>}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <SectionCard icon={null} title="Contact Information">
          {editBasic ? (
            <div className="space-y-3">
              <InputField label="Full Name" value={profile.full_name || ""} onChange={(v) => setProfile((p) => ({ ...p, full_name: v }))} placeholder="Your name" />
              <InputField label="Headline" value={profile.headline || ""} onChange={(v) => setProfile((p) => ({ ...p, headline: v }))} placeholder="e.g. Frontend Developer" />
              <InputField label="Phone" value={profile.phone || ""} onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} placeholder="+20 10 0000 0000" />
              <InputField label="Location" value={profile.location || ""} onChange={(v) => setProfile((p) => ({ ...p, location: v }))} placeholder="City, Country" />
              <InputField label="LinkedIn URL" value={profile.linkedin_url || ""} onChange={(v) => setProfile((p) => ({ ...p, linkedin_url: v }))} placeholder="https://linkedin.com/in/..." />
              <div className="flex items-center gap-2 pt-1">
                <button onClick={handleCancelBasic} className="px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/70 rounded-md hover:bg-secondary/50 transition-colors">Cancel</button>
                <button onClick={handleSaveBasic} disabled={savingBasic} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  <Check className="w-3 h-3" />{savingBasic ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user?.email && <div className="flex items-center gap-2.5 text-sm text-muted-foreground"><Mail className="w-4 h-4 shrink-0 text-primary/60" /><span>{user.email}</span></div>}
                {profile.phone && <div className="flex items-center gap-2.5 text-sm text-muted-foreground"><Phone className="w-4 h-4 shrink-0 text-primary/60" /><span>{profile.phone}</span></div>}
                {profile.location && <div className="flex items-center gap-2.5 text-sm text-muted-foreground"><MapPin className="w-4 h-4 shrink-0 text-primary/60" /><span>{profile.location}</span></div>}
                {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-primary hover:underline"><Globe className="w-4 h-4 shrink-0" /><span className="truncate">LinkedIn</span><ExternalLink className="w-3 h-3 shrink-0 ml-auto" /></a>}
              </div>
              {isOwn && <button onClick={() => setEditBasic(true)} className="mt-3 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-primary border border-border/60 rounded-md hover:border-primary/30 transition-colors"><Pencil className="w-3 h-3" />Edit</button>}
            </>
          )}
        </SectionCard>

        {/* Bio */}
        <SectionCard icon={BookOpen} title="About">
          {editBio ? (
            <div>
              <textarea className="w-full text-sm bg-background border border-border/70 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-y" value={profile.bio || ""} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." />
              <div className="flex items-center gap-2 mt-3">
                <button onClick={handleCancelBio} className="px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/70 rounded-md hover:bg-secondary/50 transition-colors">Cancel</button>
                <button onClick={handleSaveBio} disabled={savingBio} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  <Check className="w-3 h-3" />{savingBio ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {profile.bio ? <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p> : <EmptyState message="No bio added yet" />}
              {isOwn && <button onClick={() => setEditBio(true)} className="mt-3 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-primary border border-border/60 rounded-md hover:border-primary/30 transition-colors"><Pencil className="w-3 h-3" />Edit</button>}
            </>
          )}
        </SectionCard>

        {/* ── ARRAY SECTIONS ── */}

        {/* Experience */}
        <SectionCard icon={Briefcase} title="Experience">
          {(profile.experience || []).length === 0 && <EmptyState message="No experience added yet" />}
          <div className="space-y-3">
            {(profile.experience || []).map((item, i) => (
              <div key={i} className="group flex items-start justify-between gap-2">
                <div className="flex-1 border-l-2 border-primary/20 pl-4">
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.company_name}{item.industry ? ` · ${item.industry}` : ""}</p>
                  {(item.from || item.to) && <p className="text-xs text-muted-foreground/70 mt-0.5">{formatDateRange(item.from, item.to)}</p>}
                  {item.description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-wrap">{item.description}</p>}
                </div>
                {isOwn && (
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit("experience", i)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteItem("experience", i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            ))}
            {isOwn && <button onClick={() => handleOpenAdd("experience")} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"><Plus className="w-3.5 h-3.5" />Add experience</button>}
          </div>
        </SectionCard>

        {/* Education */}
        <SectionCard icon={GraduationCap} title="Education">
          {(profile.education || []).length === 0 && <EmptyState message="No education added yet" />}
          <div className="space-y-3">
            {(profile.education || []).map((item, i) => (
              <div key={i} className="group flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{item.level}{item.major ? ` in ${item.major}` : ""}</h3>
                    <p className="text-xs text-muted-foreground">{item.university}</p>
                    {item.faculty && <p className="text-xs text-muted-foreground/70">{item.faculty}</p>}
                    {(item.start_year || item.end_year) && <p className="text-xs text-muted-foreground/70 mt-0.5">{item.start_year}{item.start_year ? " – " : ""}{item.end_year}{item.grade ? ` · ${item.grade}` : ""}</p>}
                  </div>
                {isOwn && (
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit("education", i)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteItem("education", i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            ))}
            {isOwn && <button onClick={() => handleOpenAdd("education")} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"><Plus className="w-3.5 h-3.5" />Add education</button>}
          </div>
        </SectionCard>

        {/* Skills */}
        <SectionCard icon={Wrench} title="Skills">
          {(profile.skills || []).length === 0 && <EmptyState message="No skills added yet" />}
          <div className="flex flex-wrap gap-2">
            {(profile.skills || []).map((item, i) => (
              <span key={i} className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 border border-primary/10 text-primary rounded-full text-xs font-medium">
                {item.name}{item.level ? <StarRatingDisplay level={item.level} labels={SKILL_LABELS} /> : ""}
                {isOwn && (
                  <span className="flex items-center gap-0.5 ml-1">
                    <button onClick={() => handleOpenEdit("skills", i)} className="text-primary/50 hover:text-primary transition-colors"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteItem("skills", i)} className="text-primary/50 hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </span>
            ))}
          </div>
          {isOwn && <button onClick={() => handleOpenAdd("skills")} className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"><Plus className="w-3.5 h-3.5" />Add skill</button>}
        </SectionCard>

        {/* Languages */}
        <SectionCard icon={Languages} title="Languages">
          {(profile.languages || []).length === 0 && <EmptyState message="No languages added yet" />}
          <div className="flex flex-wrap gap-2">
            {(profile.languages || []).map((item, i) => (
              <span key={i} className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/50 border border-border/50 text-foreground rounded-full text-xs font-medium">
                {item.name}{item.level ? <StarRatingDisplay level={item.level} labels={LANG_LABELS} /> : ""}
                {isOwn && (
                  <span className="flex items-center gap-0.5 ml-1">
                    <button onClick={() => handleOpenEdit("languages", i)} className="text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteItem("languages", i)} className="text-muted-foreground hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </span>
            ))}
          </div>
          {isOwn && <button onClick={() => handleOpenAdd("languages")} className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"><Plus className="w-3.5 h-3.5" />Add language</button>}
        </SectionCard>

        {/* Certificates */}
        <SectionCard icon={BadgeCheck} title="Certificates">
          {(profile.certificates || []).length === 0 && <EmptyState message="No certificates added yet" />}
          <div className="space-y-3">
            {(profile.certificates || []).map((item, i) => (
              <div key={i} className="group flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.organization}{item.date ? ` · ${new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : ""}</p>
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-0.5 inline-block">View credential</a>}
                    {item.image && <img src={item.image} alt={item.name} className="mt-2 max-w-[160px] rounded-lg border border-border/60 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLightboxSrc(item.image)} />}
                  </div>
                </div>
                {isOwn && (
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit("certificates", i)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteItem("certificates", i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {isOwn && <button onClick={() => handleOpenAdd("certificates")} className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"><Plus className="w-3.5 h-3.5" />Add certificate</button>}
        </SectionCard>

        {/* Projects */}
        <SectionCard icon={FolderGit2} title="Projects">
          {(profile.projects || []).length === 0 && <EmptyState message="No projects added yet" />}
          <div className="space-y-3">
            {(profile.projects || []).map((item, i) => (
              <div key={i} className="group flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><ExternalLink className="w-3 h-3" /></a>}
                  </div>
                  {item.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>}
                  {item.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {item.technologies.map((t, ti) => <span key={ti} className="px-2 py-0.5 bg-secondary/40 text-muted-foreground rounded text-[10px] font-medium">{t}</span>)}
                    </div>
                  )}
                  {item.images?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.images.map((img, ii) => <img key={ii} src={img} alt="" className="w-20 h-16 rounded-lg object-cover border border-border/60 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLightboxSrc(img)} />)}
                    </div>
                  )}
                </div>
                {isOwn && (
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit("projects", i)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteItem("projects", i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {isOwn && <button onClick={() => handleOpenAdd("projects")} className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"><Plus className="w-3.5 h-3.5" />Add project</button>}
        </SectionCard>

        {/* Volunteering */}
        <SectionCard icon={HeartHandshake} title="Volunteering">
          {(profile.volunteering || []).length === 0 && <EmptyState message="No volunteering added yet" />}
          <div className="space-y-3">
            {(profile.volunteering || []).map((item, i) => (
              <div key={i} className="group flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{item.role}{item.organization ? ` @ ${item.organization}` : ""}</h3>
                  {(item.start || item.end) && <p className="text-xs text-muted-foreground/70 mt-0.5">{formatDateRange(item.start, item.end)}</p>}
                  {item.description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>}
                </div>
                {isOwn && (
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit("volunteering", i)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteItem("volunteering", i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {isOwn && <button onClick={() => handleOpenAdd("volunteering")} className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"><Plus className="w-3.5 h-3.5" />Add volunteering</button>}
        </SectionCard>
      </div>

      {/* Item Dialog */}
      {dialog && (
        <ItemDialog
          open
          onClose={handleCloseDialog}
          title={dialog.index == null ? `Add ${dialog.section}` : `Edit ${dialog.section}`}
          onSave={handleSaveDialog}
          saving={savingDialog}
        >
          {dialog.section === "experience" && (
            <div className="space-y-3">
              <InputField label="Job Title" value={dialog.data.title || ""} onChange={(v) => handleDialogChange("title", v)} placeholder="Job title" />
              <InputField label="Company Name" value={dialog.data.company_name || ""} onChange={(v) => handleDialogChange("company_name", v)} placeholder="Company name" />
              <InputField label="Industry" value={dialog.data.industry || ""} onChange={(v) => handleDialogChange("industry", v)} placeholder="Industry" />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Start Date" type="month" value={dialog.data.from || ""} onChange={(v) => handleDialogChange("from", v)} />
                <InputField label="End Date" type="month" value={dialog.data.to || ""} onChange={(v) => handleDialogChange("to", v)} />
              </div>
              <InputField label="Description" value={dialog.data.description || ""} onChange={(v) => handleDialogChange("description", v)} placeholder="Describe your role..." multiline />
            </div>
          )}

          {dialog.section === "education" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Degree Level</label>
                <select
                  value={dialog.data.level || ""}
                  onChange={(e) => handleDialogChange("level", e.target.value)}
                  className="w-full text-sm bg-background border border-border/70 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value="">Select degree level</option>
                  {DEGREE_LEVELS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <InputField label="University" value={dialog.data.university || ""} onChange={(v) => handleDialogChange("university", v)} placeholder="University" />
              <InputField label="Faculty" value={dialog.data.faculty || ""} onChange={(v) => handleDialogChange("faculty", v)} placeholder="Faculty" />
              <InputField label="Major" value={dialog.data.major || ""} onChange={(v) => handleDialogChange("major", v)} placeholder="Major" />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Start Year" type="number" value={dialog.data.start_year || ""} onChange={(v) => handleDialogChange("start_year", v)} placeholder="Start year" />
                <InputField label="End Year" type="number" value={dialog.data.end_year || ""} onChange={(v) => handleDialogChange("end_year", v)} placeholder="End year" />
              </div>
              <InputField label="Grade" value={dialog.data.grade || ""} onChange={(v) => handleDialogChange("grade", v)} placeholder="Grade" />
            </div>
          )}

          {dialog.section === "skills" && (
            <div className="space-y-3">
              <InputField label="Skill Name" value={dialog.data.name || ""} onChange={(v) => handleDialogChange("name", v)} placeholder="Skill name" />
              <StarRatingInput value={parseInt(dialog.data.level, 10) || 0} onChange={(v) => handleDialogChange("level", v)} labels={SKILL_LABELS} />
            </div>
          )}

          {dialog.section === "languages" && (
            <div className="space-y-3">
              <InputField label="Language" value={dialog.data.name || ""} onChange={(v) => handleDialogChange("name", v)} placeholder="Language" />
              <StarRatingInput value={parseInt(dialog.data.level, 10) || 0} onChange={(v) => handleDialogChange("level", v)} labels={LANG_LABELS} />
            </div>
          )}

          {dialog.section === "certificates" && (
            <div className="space-y-3">
              <InputField label="Certificate Name" value={dialog.data.name || ""} onChange={(v) => handleDialogChange("name", v)} placeholder="Certificate name" />
              <InputField label="Organization" value={dialog.data.organization || ""} onChange={(v) => handleDialogChange("organization", v)} placeholder="Organization" />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Date" type="month" value={dialog.data.date || ""} onChange={(v) => handleDialogChange("date", v)} />
                <InputField label="Field" value={dialog.data.field || ""} onChange={(v) => handleDialogChange("field", v)} placeholder="Field" />
              </div>
              <InputField label="Credential URL" value={dialog.data.url || ""} onChange={(v) => handleDialogChange("url", v)} placeholder="https://..." />
              <ImageUpload bucket="certificates" currentUrls={dialog.data.image ? [dialog.data.image] : []} onUploaded={(url, removeIdx) => {
                if (removeIdx != null) { handleDialogChange("image", ""); return; }
                handleDialogChange("image", url);
              }} />
            </div>
          )}

          {dialog.section === "projects" && (
            <div className="space-y-3">
              <InputField label="Project Name" value={dialog.data.name || ""} onChange={(v) => handleDialogChange("name", v)} placeholder="Project name" />
              <InputField label="Description" value={dialog.data.description || ""} onChange={(v) => handleDialogChange("description", v)} placeholder="Description..." multiline />
              <InputField label="Technologies" value={Array.isArray(dialog.data.technologies) ? dialog.data.technologies.join(", ") : dialog.data.technologies || ""} onChange={(v) => handleDialogChange("technologies", v.split(",").map((s) => s.trim()))} placeholder="Comma-separated" />
              <InputField label="Project URL" value={dialog.data.url || ""} onChange={(v) => handleDialogChange("url", v)} placeholder="https://..." />
              <ImageUpload bucket="projects" currentUrls={dialog.data.images || []} onUploaded={(url, removeIdx) => {
                const imgs = [...(dialog.data.images || [])];
                if (removeIdx != null) { imgs.splice(removeIdx, 1); handleDialogChange("images", imgs); return; }
                handleDialogChange("images", [...imgs, url]);
              }} />
            </div>
          )}

          {dialog.section === "volunteering" && (
            <div className="space-y-3">
              <InputField label="Organization" value={dialog.data.organization || ""} onChange={(v) => handleDialogChange("organization", v)} placeholder="Organization" />
              <InputField label="Role" value={dialog.data.role || ""} onChange={(v) => handleDialogChange("role", v)} placeholder="Role" />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Start Date" type="month" value={dialog.data.start || ""} onChange={(v) => handleDialogChange("start", v)} />
                <InputField label="End Date" type="month" value={dialog.data.end || ""} onChange={(v) => handleDialogChange("end", v)} />
              </div>
              <InputField label="Description" value={dialog.data.description || ""} onChange={(v) => handleDialogChange("description", v)} placeholder="Description..." multiline />
            </div>
          )}
        </ItemDialog>
      )}

      <AvatarModal
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        userId={user?.id}
        currentUrl={profile.profile_pic}
        onUpdated={handleAvatarChange}
        onDeleted={() => handleAvatarChange(null)}
      />

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} alt="" onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
