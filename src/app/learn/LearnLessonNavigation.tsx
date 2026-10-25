/** Only implemented lessons belong in this list. Order is presentation, not a gate. */
export const LEARN_LESSONS = [
  { id: "look-around", title: "Look Around" },
  { id: "follow-motion", title: "Follow Motion" },
  { id: "read-motion", title: "Read the Motion" },
  { id: "compare-flow", title: "Compare the Flow" },
] as const;

export type LearnLessonId = typeof LEARN_LESSONS[number]["id"];

/** A lesson may guard departure without moving session state into the layout. */
export interface LearnDepartureHandle {
  requestLeave: (label: string, action: () => void) => void;
}

export function LearnLessonNavigation({ current, onSelect }: {
  current: LearnLessonId;
  onSelect: (lesson: LearnLessonId) => void;
}) {
  return <nav className="learn__lessons" aria-label="Learn lessons">
    {LEARN_LESSONS.map((lesson, index) => <button key={lesson.id} type="button"
      className="ui-button learn__lesson" aria-label={lesson.title} aria-current={current === lesson.id ? "page" : undefined}
      onClick={() => onSelect(lesson.id)}><span className="learn__lesson-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span>{lesson.title}</span></button>)}
  </nav>;
}
