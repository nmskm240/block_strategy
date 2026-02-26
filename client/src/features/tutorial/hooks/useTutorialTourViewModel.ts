import { useCallback, useEffect, useState } from "react";
import {
  ACTIONS,
  EVENTS,
  STATUS,
  type CallBackProps,
  type Step,
} from "react-joyride";

type TutorialStepAsset = {
  target: string;
  placement?: Step["placement"];
  title: string;
  content: string;
};

type Params = {
  run: boolean;
  onStop: () => void;
  stepsUrl: string;
};

export function useTutorialTourViewModel({
  run,
  onStop,
  stepsUrl,
}: Params) {
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const response = await fetch(stepsUrl, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to load tutorial steps (${response.status})`);
      }

      const parsed = (await response.json()) as TutorialStepAsset[];
      if (cancelled) return;

      setSteps(
        parsed.map((step) => ({
          ...step,
          placement: step.placement ?? "left",
          disableBeacon: true,
        })),
      );
    })().catch(() => {
      if (!cancelled) {
        setSteps([]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [stepsUrl]);

  useEffect(() => {
    if (run && steps.length > 0) {
      setStepIndex(0);
    }
  }, [run, steps.length]);

  const onJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { action, index, status, type } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setStepIndex(0);
        onStop();
        return;
      }

      if (type === EVENTS.TARGET_NOT_FOUND) {
        setStepIndex((current) => current + 1);
        return;
      }

      if (type === EVENTS.STEP_AFTER) {
        setStepIndex(action === ACTIONS.PREV ? index - 1 : index + 1);
      }
    },
    [onStop],
  );

  return {
    run: run && steps.length > 0,
    stepIndex,
    steps,
    onJoyrideCallback,
  };
}
