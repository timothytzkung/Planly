import { degreeRegistry } from "./degreeRegistry.js";
import { analyzeDegree } from "./engine/analyzeDegree.js";

export async function analyzeStudentDegree({ transcriptData, degreeType, owner }) {
  const degreeRules = degreeRegistry[degreeType];

  if (!degreeRules) {
    throw new Error(`Unknown degree type: ${degreeType}`);
  }

  return analyzeDegree({
    transcriptData,
    degreeRules,
    owner
  });
}