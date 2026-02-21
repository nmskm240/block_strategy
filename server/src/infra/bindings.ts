export type R2ObjectBodyLike = {
  text(): Promise<string>;
};

export type R2BucketLike = {
  get(key: string): Promise<R2ObjectBodyLike | null>;
  put(key: string, value: string): Promise<unknown>;
  list?(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    objects: Array<{ key: string }>;
    truncated?: boolean;
    cursor?: string;
  }>;
};

export type WorkerBindings = {
  OHLCV_BUCKET?: R2BucketLike;
  OHLCV_OBJECT_PREFIX?: string;
  TWELVE_DATA_API_KEY?: string;
  TWELVE_DATA_BASE_URL?: string;
};
