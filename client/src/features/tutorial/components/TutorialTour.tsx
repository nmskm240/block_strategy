import { appPaletteCustom } from "@/theme";
import Joyride from "react-joyride";
import { useTutorialTourViewModel } from "@/features/tutorial/hooks/useTutorialTourViewModel";

type Props = {
  run: boolean;
  onStop: () => void;
};

const BUILDER_TUTORIAL_STEPS_URL = `${import.meta.env.BASE_URL}tutorials/builder-tour.json`;

export function TutorialTour({ run, onStop }: Props) {
  const vm = useTutorialTourViewModel({
    run,
    onStop,
    stepsUrl: BUILDER_TUTORIAL_STEPS_URL,
  });

  return (
    <Joyride
      run={vm.run}
      stepIndex={vm.stepIndex}
      steps={vm.steps}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      scrollToFirstStep={false}
      callback={vm.onJoyrideCallback}
      locale={{
        back: "戻る",
        close: "閉じる",
        last: "完了",
        next: "次へ",
        skip: "スキップ",
      }}
      styles={{
        options: {
          zIndex: 20000,
          primaryColor: appPaletteCustom.overlay.tourPrimary,
        },
      }}
    />
  );
}
