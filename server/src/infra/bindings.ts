export type R2ObjectBodyLike = {
  text(): Promise<string>;
};

export type R2BucketLike = {
  get(key: string): Promise<R2ObjectBodyLike | null>;
  put(key: string, value: string): Promise<unknown>;
};

export type WorkerBindings = {
  OHLCV_BUCKET?: R2BucketLike;
  OHLCV_OBJECT_PREFIX?: string;
};
