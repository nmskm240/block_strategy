import { useEffect, useMemo, useState } from "react";
import Joyride, {
  ACTIONS,
  EVENTS,
  STATUS,
  type CallBackProps,
  type Step,
} from "react-joyride";
import { appPaletteCustom } from "@/theme";

type BuilderTutorialTourProps = {
  run: boolean;
  onStop: () => void;
};

export function BuilderTutorialTour({ run, onStop }: BuilderTutorialTourProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (run) {
      setStepIndex(0);
    }
  }, [run]);

  const steps = useMemo<Step[]>(
    () => [
      {
        target: '[data-tour="editor-canvas"]',
        placement: "right",
        title: "ノード追加",
        content:
          "キャンバス上で右クリックするとコンテキストメニューが開き、ノードを追加できます。",
      },
      {
        target: '[data-tour="editor-canvas"]',
        placement: "right",
        title: "ノード接続",
        content:
          "ノードを追加したら、丸いポートをドラッグして別ノードのポートへ接続できます。",
      },
      {
        target: '[data-tour="backtest-run-button"]',
        placement: "left",
        title: "バックテスト実行",
        content:
          "実行ボタンから銘柄と期間を指定してバックテストを開始できます。",
      },
    ],
    [],
  );

  function onCallback(data: CallBackProps) {
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
      const nextIndex = action === ACTIONS.PREV ? index - 1 : index + 1;
      setStepIndex(nextIndex);
    }
  }

  return (
    <Joyride
      run={run}
      stepIndex={stepIndex}
      steps={steps}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      scrollToFirstStep={false}
      callback={onCallback}
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
