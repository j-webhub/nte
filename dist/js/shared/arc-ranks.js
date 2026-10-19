export function interpolateArcRankEffect(arc, rank) {
  const rankEffects = arc.rankEffects || {};
  const exact = rankEffects["R" + rank];
  if (typeof exact === "string" && exact.trim()) return exact;
  if (
    rank < 2 ||
    rank > 4 ||
    !rankEffects.R1 ||
    !rankEffects.R5 ||
    !Array.isArray(arc.rankInterpolationPairs)
  )
    return "";
  const tokenPattern = /[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?/g;
  const startTokens = rankEffects.R1.match(tokenPattern) || [];
  const endTokens = rankEffects.R5.match(tokenPattern) || [];
  const pairs = new Map(
    arc.rankInterpolationPairs.map(([startIndex, endIndex]) => [
      startIndex,
      endIndex
    ])
  );
  const fraction = (rank - 1) / 4;
  let tokenIndex = 0;
  return rankEffects.R1.replace(tokenPattern, (token) => {
    const currentIndex = tokenIndex++;
    const endIndex = pairs.get(currentIndex);
    if (
      endIndex === undefined ||
      startTokens[currentIndex] === undefined ||
      endTokens[endIndex] === undefined
    )
      return token;
    const startValue = Number(startTokens[currentIndex].replace(/,/g, ""));
    const endValue = Number(endTokens[endIndex].replace(/,/g, ""));
    const value = startValue + (endValue - startValue) * fraction;
    const sign = value < 0 ? "-" : token.startsWith("+") ? "+" : "";
    const fixed = Number(Math.abs(value).toFixed(4)).toString();
    let [whole, decimal] = fixed.split(".");
    if (token.includes(",")) whole = Number(whole).toLocaleString("en-US");
    return sign + whole + (decimal ? "." + decimal : "");
  });
}
