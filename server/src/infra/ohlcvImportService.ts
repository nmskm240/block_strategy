import type { DateRange } from "@shared/types";
import type { IOhlcvRepository } from "@server/domain/ohlcv";
import { csvToOhlcvs, ohlcvsToCsv } from "./converters";

export class OhlcvImportService {
  constructor(private readonly repository: IOhlcvRepository) {}

  async importCsv(symbol: string, csv: string): Promise<void> {
    await this.repository.putOhlcvs(symbol, csvToOhlcvs(csv));
  }

  async exportCsv(symbol: string, range: DateRange): Promise<string> {
    const ohlcvs = await this.repository.getOhlcvs(symbol, range);
    return ohlcvsToCsv(ohlcvs);
  }
}
