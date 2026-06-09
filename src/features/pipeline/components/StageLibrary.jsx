// src\features\pipeline\components\StageLibrary.jsx
import React from "react";
import {
  FileText,
  Sparkles,
  ClipboardList,
  Code2,
  Video,
  Cpu,
  Users,
  UserCheck,
  ShieldCheck,
  Award,
} from "lucide-react";
import { STAGE_LIBRARY } from "../constants/stageLibrary";
import { useTranslation } from "react-i18next";

const ICON_MAP = {
  FileText,
  Sparkles,
  ClipboardList,
  Code2,
  Video,
  Cpu,
  Users,
  UserCheck,
  ShieldCheck,
  Award,
};

export default function StageLibrary({ onAddStage }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Library Title Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border bg-surface backdrop-blur-xs sticky top-0 z-10">
        <p className="text-[10px] font-bold text-muted-foreground/80 tracking-widest uppercase">
          {t("stage_details.stage_library")}
        </p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          {t("stage_details.click_to_append")}
        </p>
      </div>

      {/* Selectable Stage Template List */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-200
          dark:[&::-webkit-scrollbar-thumb]:bg-slate-800
          dark:[&::-webkit-scrollbar-thumb]:hover:bg-slate-700"
      >
        {STAGE_LIBRARY.map((item) => {
          const Icon = ICON_MAP[item.icon] || FileText;
          return (
            <button
              key={item.key}
              onClick={() => onAddStage(item)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/20 transition-all group cursor-pointer text-start"
            >
              {/* Icon Container Wrapper */}
              <div className="w-8 h-8 bg-secondary dark:bg-slate-800 border border-border/40 dark:border-slate-700/50 group-hover:bg-primary/10 group-hover:border-primary/10 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors stroke-[2.2]" />
              </div>

              {/* Template Meta Context */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground group-hover:text-primary leading-tight transition-colors">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground/80 dark:text-slate-400 font-medium truncate mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}