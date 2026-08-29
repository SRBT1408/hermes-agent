import { describe, expect, it } from "vitest";

import { computeTouchScrollStep } from "./pty-touch-scroll";

describe("computeTouchScrollStep", () => {
  it("turns an upward finger swipe into downward terminal scrolling", () => {
    expect(computeTouchScrollStep(24, 12, 0)).toEqual({
      lines: 2,
      carryPx: 0,
    });
  });

  it("turns a downward finger swipe into upward terminal scrolling", () => {
    expect(computeTouchScrollStep(-24, 12, 0)).toEqual({
      lines: -2,
      carryPx: 0,
    });
  });

  it("accumulates sub-line touch movement for smooth tablet scrolling", () => {
    const first = computeTouchScrollStep(5, 12, 0);
    expect(first).toEqual({ lines: 0, carryPx: 5 });

    expect(computeTouchScrollStep(8, 12, first.carryPx)).toEqual({
      lines: 1,
      carryPx: 1,
    });
  });

  it("uses a safe line height when the terminal has not been measured", () => {
    expect(computeTouchScrollStep(20, 0, 0)).toEqual({
      lines: 1,
      carryPx: 4,
    });
  });
});
