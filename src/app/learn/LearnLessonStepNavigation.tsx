import { LEARN_LESSONS, type LearnLessonId } from "./LearnLessonNavigation.js";

/** Presentation only; the parent retains the single guarded transition path. */
export function LearnLessonStepNavigation({ current, onSelect }: {
  current: LearnLessonId;
  onSelect: (lesson: LearnLessonId) => void;
}) {
  const index = LEARN_LESSONS.findIndex(lesson => lesson.id === current);
  const previous = LEARN_LESSONS[index - 1];
  const next = LEARN_LESSONS[index + 1];
  return <nav className="learn__step-navigation" aria-label="Previous and next lessons">
    {previous && <button type="button" className="ui-button" onClick={() => onSelect(previous.id)}>Back: {previous.title}</button>}
    {next && <button type="button" className="ui-button ui-button--primary" onClick={() => onSelect(next.id)}>Next: {next.title}</button>}
  </nav>;
}
