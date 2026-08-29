export interface TouchScrollStep {
  lines: number;
  carryPx: number;
}

/**
 * Convert vertical finger movement into terminal scrollback rows.
 * Positive delta means the finger moved up and the transcript should move down.
 */
export function computeTouchScrollStep(
  deltaPx: number,
  lineHeightPx: number,
  carryPx: number,
): TouchScrollStep {
  const safeLineHeight = lineHeightPx > 0 ? lineHeightPx : 16;
  const totalPx = carryPx + deltaPx;
  const lines = Math.trunc(totalPx / safeLineHeight);
  return {
    lines,
    carryPx: totalPx - lines * safeLineHeight,
  };
}
