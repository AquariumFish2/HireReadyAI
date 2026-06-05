import { useState } from "react";
import AvatarModal from "./AvatarModal";

export default function ApplicantHeader({
  fullName,
  profile_pic,
  userId,
  onAvatarChange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-white border border-dark-amethyst-100 rounded-2xl p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          {/* AVATAR CLICKABLE */}
          <div
            className="cursor-pointer relative group"
            onClick={() => setOpen(true)}
          >
            {profile_pic ? (
              <img
                src={profile_pic}
                className="w-11 h-11 rounded-full object-cover border border-dark-amethyst-100 group-hover:opacity-80 transition"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-dark-amethyst-100 flex items-center justify-center text-dark-amethyst-700 font-bold group-hover:opacity-80 transition">
                {fullName?.[0] || "U"}
              </div>
            )}

            {/* small edit icon */}
            <div className="absolute bottom-0 right-0 bg-dark-amethyst-600 text-white text-[10px] px-1 rounded-full">
              ✎
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-dark-amethyst-950">
              HireReadyAI
            </h1>

            <p className="text-sm text-dark-amethyst-500 mt-1">
              Welcome back, {fullName}
            </p>
          </div>
        </div>

        <div className="text-sm font-medium px-4 py-2 rounded-full bg-dark-amethyst-50 text-dark-amethyst-700 border border-dark-amethyst-100">
          Your applications
        </div>
      </div>

      {/* MODAL */}
      <AvatarModal
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
        currentUrl={profile_pic}
        onUpdated={(url) => onAvatarChange?.(url)}
        onDeleted={() => onAvatarChange?.(null)}
      />
    </>
  );
}
