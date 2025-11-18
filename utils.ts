
export const levenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

export const findBestMatch = (input: string, commands: string[]): string | null => {
  let bestMatch = null;
  let minDistance = Infinity;

  for (const cmd of commands) {
    const distance = levenshteinDistance(input, cmd);
    if (distance < minDistance && distance <= 2 && distance < input.length) {
      minDistance = distance;
      bestMatch = cmd;
    }
  }

  return bestMatch;
};
