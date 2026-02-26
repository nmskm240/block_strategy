import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export function decompressJsonFromUrlParam(encoded: string): string {
  const trimmed = encoded.trim();
  if (!trimmed) {
    throw new Error("Empty URL graph parameter.");
  }

  if (!trimmed.startsWith("lz.")) {
    throw new Error("Unsupported URL graph parameter format.");
  }

  const decompressed = decompressFromEncodedURIComponent(trimmed.slice(3));
  if (decompressed == null) {
    throw new Error("Invalid LZ-compressed URL graph parameter.");
  }
  return decompressed;
}

export function encodeJsonToLzUrlParam(json: string): string {
  if (!json.trim()) {
    throw new Error("JSON is empty.");
  }

  // Validate before exporting so generated payload is importable.
  JSON.parse(json);

  const compressed = compressToEncodedURIComponent(json);
  if (compressed == null || compressed.length === 0) {
    throw new Error("Failed to compress graph for URL.");
  }

  return `lz.${compressed}`;
}
