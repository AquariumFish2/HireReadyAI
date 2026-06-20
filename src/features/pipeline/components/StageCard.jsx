// src\features\pipeline\components\StageCard.jsx
import React from "react";
import { GripVertical, Trash2, Lock } from "lucide-react";
import { STAGE_LIBRARY } from "../constants/stageLibrary";

export default function StageCard({
  stage,
  isSelected,
  onSelect,
  onDelete,
  provided,
  snapshot,
}) {
  const libItem = STAGE_LIBRARY.find((s) => s.key === stage.stage_type);
  const isComingSoon = libItem?.comingSoon;

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      style={provided.draggableProps.style}
      onClick={() => !isComingSoon && onSelect(stage)}
      className={`group relative flex items-center gap-3 rounded-xl border px-4 py-4 transition-colors duration-150 select-none ${
        isComingSoon
          ? "border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 cursor-not-allowed opacity-50"
          : isSelected
            ? "border-primary bg-primary/10 dark:bg-primary/20 shadow-sm ring-1 ring-primary/40 cursor-pointer"
            : snapshot.isDragging
              ? "border-primary/50 bg-white dark:bg-background shadow-lg dark:shadow-black/50 cursor-grab"
              : "border-gray-200 dark:border-slate-700/50 bg-white dark:bg-background hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-sm cursor-pointer"
      }`}
    >
      {/* Drag Handle or Lock */}
      <div
        {...provided.dragHandleProps}
        onClick={(e) => e.stopPropagation()}
        className={`shrink-0 ${stage.is_locked || isComingSoon
          ? "text-gray-300 dark:text-slate-600 cursor-not-allowed"
          : "text-gray-300 dark:text-slate-500 hover:text-gray-500 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing"
          }`}
      >
        {stage.is_locked ? (
          <Lock className="w-4 h-4" />
        ) : (
          <GripVertical className="w-4 h-4" />
        )}
      </div>

      {/* Stage Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-tight truncate flex items-center gap-1.5 ${
            isComingSoon
              ? "text-gray-400 dark:text-slate-500"
              : isSelected
                ? "text-gray-900 dark:text-slate-50"
                : "text-gray-900 dark:text-slate-200"
          }`}
        >
          {stage.name}
          {isComingSoon && (
            <span className="text-[9px] font-bold text-gray-300 dark:text-slate-600 uppercase tracking-wider">
              Soon
            </span>
          )}
        </p>
        <p className={`text-xs mt-0.5 truncate capitalize ${
          isComingSoon
            ? "text-gray-300 dark:text-slate-600"
            : "text-gray-400 dark:text-slate-400"
        }`}>
          {isComingSoon ? "Coming soon" : stage.stage_type?.replace(/_/g, " ")}
        </p>
      </div>

      {/* Delete button — hidden for coming soon stages */}
      {!stage.is_locked && !isComingSoon && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(stage.id);
          }}
          className="shrink-0 p-1.5 rounded-lg text-gray-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          title="Delete stage"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}