import { useMemo } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { useApplications } from "@/features/applications/context/application.context";

export default function ProfileStrength() {
  const { profile } = useUser();
  const { applications } = useApplications();

  const strength = useMemo(() => {
    let score = 40; // base score

    if (profile?.cv_url) score += 20;
    if (profile?.skills?.length >= 5) score += 15;
    if (applications?.length > 0) score += 15;
    if (profile?.experience) score += 10;

    return Math.min(score, 100);
  }, [profile, applications]);

  const checklist = [
    {
      label: "CV uploaded",
      done: !!profile?.cv_url,
    },
    {
      label: "Work experience",
      done: !!profile?.experience,
    },
    {
      label: "Add portfolio links",
      done: !!profile?.portfolio,
    },
    {
      label: "Add 5+ skills",
      done: (profile?.skills?.length || 0) >= 5,
    },
  ];

  const remaining = checklist.filter((i) => !i.done).length;

  return (
    <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h2 className="text-base font-bold text-dark-amethyst-950">
          Profile strength
        </h2>

        <span className="text-2xl font-bold text-dark-amethyst-600">
          {strength}
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-dark-amethyst-500 -mt-2">
        Complete profile = better matches
      </p>

      {/* Progress bar */}
      <div className="w-full bg-dark-amethyst-100 rounded-full h-2.5">
        <div
          className="bg-dark-amethyst-600 h-2.5 rounded-full transition-all"
          style={{ width: `${strength}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2 text-sm">
        {checklist.map((item, idx) => (
          <p
            key={idx}
            className={
              item.done ? "text-dark-amethyst-800" : "text-dark-amethyst-600"
            }
          >
            {item.label}
          </p>
        ))}
      </div>

      {/* Footer */}
      <p className="text-xs text-dark-amethyst-400">
        {remaining} things left to complete profile
      </p>
    </div>
  );
}
