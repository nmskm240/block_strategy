export const builderDefaultGraphPath = `${import.meta.env.BASE_URL}default-strategy.graph.json`;

export async function loadBuilderDefaultGraphJson(): Promise<string> {
  const response = await fetch(builderDefaultGraphPath, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to load default graph (${response.status})`);
  }
  return await response.text();
}

export const builderDefaultGraphRouteState = {
  initialGraph: "default",
} as const;

export function shouldLoadDefaultBuilderGraph(
  state: unknown,
): state is { initialGraph: "default" } {
  return (
    typeof state === "object" &&
    state !== null &&
    "initialGraph" in state &&
    state.initialGraph === "default"
  );
}
