import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = i18n.language;

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-1
          px-3 py-1.5
          rounded-md
          bg-white/10
          text-white
          text-xs font-medium
          hover:bg-white/20
          hover:opacity-90
          transition-all
          duration-200
        "
      >
        {currentLang.toUpperCase()}
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 w-20
            rounded-md
            bg-dark-amethyst-950
            border border-white/10
            shadow-lg
            overflow-hidden
            z-50
          "
        >
          <button
            onClick={() => changeLang("en")}
            className={`
              w-full text-left px-3 py-2 text-xs
              hover:bg-white/10
              transition
              ${currentLang === "en" ? "bg-white/10 text-white" : "text-gray-300"}
            `}
          >
            EN
          </button>

          <button
            onClick={() => changeLang("ar")}
            className={`
              w-full text-left px-3 py-2 text-xs
              hover:bg-white/10
              transition
              ${currentLang === "ar" ? "bg-white/10 text-white" : "text-gray-300"}
            `}
          >
            AR
          </button>
        </div>
      )}
    </div>
  );
}
