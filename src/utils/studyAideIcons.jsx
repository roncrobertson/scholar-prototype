import React from 'react';
import {
  Bot,
  FileText,
  LayoutGrid,
  Palette,
  PenLine,
  Headphones,
} from 'lucide-react';

/** Maps study aide id to Lucide icon component. Use for StudyAideLauncher, StudyModeSwitcher, etc. */
export const studyAideIconMap = {
  tutor: Bot,
  summary: FileText,
  flashcards: LayoutGrid,
  picmonics: Palette,
  practice: PenLine,
  podcast: Headphones,
};

/** Render study aide icon; fallback to Palette if unknown. */
export function StudyAideIcon({ aideId, className = 'w-5 h-5', ...props }) {
  const Icon = studyAideIconMap[aideId] ?? Palette;
  return <Icon className={className} aria-hidden {...props} />;
}
