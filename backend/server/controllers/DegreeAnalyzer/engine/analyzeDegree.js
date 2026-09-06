import { parseTranscriptData } from "./parseTranscript.js";
import { calculateGPAs } from "./calculateGPA.js";
import { evaluateRequirement } from "./evaluateRequirement.js";
import { generateSummary } from "./generateSummary.js";
import { generateRecommendations } from "./generateRecommendations.js";
import { generateTimeline } from "./generateTimeline.js";

export async function analyzeDegree({ transcriptData, degreeRules, owner }) {
  const courses = parseTranscriptData(transcriptData);

  const completed = courses.filter(
    c => c.status === "completed" || c.status === "pass"
  );

  const inProgress = courses.filter(
    c => c.status === "in-progress"
  );

  const gpa = calculateGPAs(courses, degreeRules);

  const requirementResults = {};

  for (const requirement of degreeRules.requirements) {
    requirementResults[requirement.id] = await evaluateRequirement({
      requirement,
      completed,
      inProgress,
      degreeRules
    });
  }

  return {
    owner: owner.id,
    degree: {
      id: degreeRules.id,
      name: degreeRules.name
    },
    summary: generateSummary(courses, gpa, requirementResults, degreeRules),
    gpa,
    requirements: requirementResults,
    recommendations: generateRecommendations(requirementResults, courses, degreeRules),
    timeline: generateTimeline(courses)
  };
}