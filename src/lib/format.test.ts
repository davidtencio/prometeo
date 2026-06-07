import { describe, expect, it } from "vitest";
import { formatFileSize } from "./format";

describe("formatFileSize", () => {
  it("formatea bytes", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("formatea kilobytes", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("formatea megabytes", () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});
