import { useEffect, useRef, useState } from "react";
import { LearnOrientationViewport } from "./LearnOrientationViewport.js";
import { LearnFollowMotion } from "./LearnFollowMotion.js";
import { LearnReadMotion } from "./LearnReadMotion.js";
import { LearnCompareFlow } from "./LearnCompareFlow.js";
import { GlobalHeader } from "../GlobalHeader.js";
import { GlobalFooter } from "../GlobalFooter.js";
import { UserGuideSurface } from "../UserGuideSurface.js";
import { GlossarySurface } from "../GlossarySurface.js";
import { WhatsNewSurface } from "../WhatsNewSurface.js";
import type { OpenResource, ResourceId } from "../shellResources.js";
import { HowItWorksSurface } from "../HowItWorksSurface.js";
import { LEARN_LESSONS, LearnLessonNavigation, type LearnDepartureHandle, type LearnLessonId } from "./LearnLessonNavigation.js";
import { LearnLessonStepNavigation } from "./LearnLessonStepNavigation.js";

export interface LearnPageProps {
  onReturnToLanding: () => void;
  onEnterExplore: () => void;
}

/** Learn is a product surface, not a computational lab.kind. */
export function LearnPage({ onReturnToLanding, onEnterExplore }: LearnPageProps) {
  const [lesson, setLesson] = useState<LearnLessonId>("look-around");
  const departure = useRef<LearnDepartureHandle>(null);
  const [resource, setResource] = useState<ResourceId | null>(null);
  const helpOpen = resource !== null;
  const helpTrigger = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [lesson]);
  const leave = (label: string, action: () => void) => {
    if (departure.current) departure.current.requestLeave(label, action);
    else action();
  };
  const selectLesson = (next: LearnLessonId) => {
    if (next === lesson) return;
    leave(LEARN_LESSONS.find(item => item.id === next)!.title, () => setLesson(next));
  };
  const lessonActions = <LearnLessonStepNavigation current={lesson} onSelect={selectLesson} />;
  const openResource: OpenResource = (next, trigger) => {
    helpTrigger.current = trigger; setResource(next);
  };
  const closeResource = () => setResource(null);

  return (
    <>
    <GlobalHeader section="learn" onHome={() => leave("Home", onReturnToLanding)}
      onExplore={() => leave("Explore", onEnterExplore)} onLearn={() => {}} onOpenResource={openResource} />
    <main className="app learn">
      <p className="learn__page-identity">Learn</p>
      <LearnLessonNavigation current={lesson} onSelect={selectLesson} />
      {lesson === "compare-flow" ? <LearnCompareFlow pausedForHelp={helpOpen} lessonActions={lessonActions} />
      : lesson === "read-motion" ? <LearnReadMotion departureRef={departure} pausedForHelp={helpOpen} lessonActions={lessonActions} />
      : lesson === "follow-motion" ? <LearnFollowMotion departureRef={departure} pausedForHelp={helpOpen} lessonActions={lessonActions} /> : <>
      <h1 ref={heading} tabIndex={-1}>Look Around</h1>
      <div className="learn__layout">
        <section className="ui-panel learn__copy" aria-label="Introduction">
          <p>How can we see air moving when air itself is invisible?</p>
          <p>We’ll use this 3D space to explore a prescribed model airflow. The grid helps you understand where you are in the model.</p>
          <p>Imagine smoke drifting in the wind. Its movement reveals where the air is going. In the next lesson, colored markers will help us see motion through the model airflow.</p>
          <p className="learn__question">We’ll start two markers at different places and watch where they go. Will their journeys look alike?</p>
          {lessonActions}
        </section>
        <LearnOrientationViewport />
      </div>
      </>}
      <section className="learn__model-note-panel" aria-labelledby="learn-model-title">
        <h2 id="learn-model-title">About this model</h2>
        <p className="learn__disclosure">This is a computer model with a prescribed velocity field, not a reconstruction or forecast of a particular storm.</p>
      </section>
    </main>
    <GlobalFooter onOpenResource={openResource} />
    <HowItWorksSurface open={resource === "how-it-works"} context="landing" onClose={closeResource} returnFocusRef={helpTrigger} />
    <UserGuideSurface open={resource === "user-guide"} onClose={closeResource} returnFocusRef={helpTrigger} />
    <GlossarySurface open={resource === "glossary"} onClose={closeResource} returnFocusRef={helpTrigger} />
    <WhatsNewSurface open={resource === "whats-new"} onClose={closeResource} returnFocusRef={helpTrigger} />
    </>
  );
}
