export type ApiResponse = {
  message: string;
  success: true;
};

export type OHLCV = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
