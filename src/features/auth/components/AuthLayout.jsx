//src\features\auth\components\AuthLayout.jsx
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/shared/ui/LanguageSwitcher";

export default function AuthLayout({ children, headline, subheading }) {
  const { t } = useTranslation();

  const featureKeys = ["match", "interviews", "feedback"];

  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:flex-col lg:w-[45%] xl:w-[40%] shrink-0 bg-dark-amethyst-950 p-12 justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 0% 0%, rgba(132,0,255,0.18) 0%, transparent 60%),
              radial-gradient(ellipse at 100% 100%, rgba(79,0,153,0.25) 0%, transparent 55%)
            `,
          }}
        />

        {/* HEADER */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-dark-amethyst-600 text-white font-bold text-sm">
              H
            </span>

            <span className="text-white text-lg font-bold tracking-tight">
              HireReady<span className="text-dark-amethyst-300">AI</span>
            </span>
          </div>

          <LanguageSwitcher />
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col gap-6 my-auto py-12">
          <div>
            <h1
              className="text-white font-black leading-[1.1] mb-4"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
              }}
            >
              {t("auth_layout.headline")}
            </h1>

            <p className="text-dark-amethyst-200/60 text-sm leading-relaxed max-w-xs mt-10 mb-5">
              {t("auth_layout.subheading")}
            </p>
          </div>

          <ul className="flex flex-col gap-4">
            {featureKeys.map((key) => (
              <li key={key} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-dark-amethyst-700 border border-dark-amethyst-500 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2 2 4-4"
                      stroke="#ce99ff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span className="text-dark-amethyst-200/75 text-sm leading-snug">
                  {t(`auth_layout.features.${key}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-8 bg-dark-amethyst-50">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-dark-amethyst-600 text-white font-bold text-sm">
              H
            </span>

            <span className="text-dark-amethyst-900 text-lg font-bold">
              HireReady<span className="text-dark-amethyst-500">AI</span>
            </span>
          </div>

          <h2 className="text-dark-amethyst-950 text-3xl font-bold mb-1">
            {headline}
          </h2>

          <p className="text-dark-amethyst-400 text-sm mb-8">{subheading}</p>

          {children}
        </div>
      </div>
    </div>
  );
}
