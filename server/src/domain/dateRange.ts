const symbol = Symbol("isDateRange");

type IsDateRange = {
  [symbol]: true;
};

export type DateRange = Readonly<
  {
    since: Date;
    until: Date;
  } & IsDateRange
>;
export const DateRange = ({
  since,
  until,
}: {
  since: Date;
  until: Date;
}): DateRange | null => {
  if (since >= until) {
    throw new Error("Invalid date range");
  }
  return {
    since,
    until,
    [symbol]: true,
  };
};
