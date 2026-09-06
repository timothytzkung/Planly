
/**
 * Generate recommendations
 */
export const generateRecommendations = (requirements, courses, degreeRules) => {
    const recommendations = [];
  
    for (const requirementResult of Object.values(requirements)) {
      if (requirementResult.isMet) continue;
  
      const recommendation = buildRequirementRecommendation(requirementResult);
  
      if (Array.isArray(recommendation)) {
        recommendations.push(...recommendation);
      } else if (recommendation) {
        recommendations.push(recommendation);
      }
    }
  
    const concentration = detectPotentialConcentration(courses, degreeRules);
  
    if (concentration) {
      recommendations.push({
        priority: "low",
        category: "Concentration",
        message: `You're close to completing the ${concentration.name} concentration.`,
        progress: concentration.progress,
        remaining: concentration.remaining
      });
    }
  
    return recommendations;
  };


  // Helper
  const buildRequirementRecommendation = (requirement) => {
    switch (requirement.type) {
      case "allCourses":
        return {
          priority: "high",
          category: requirement.name,
          message: `Complete missing required courses: ${requirement.missing.join(", ")}`,
          remaining: requirement.missing
        };
  
      case "chooseCourses":
        return {
          priority: "high",
          category: requirement.name,
          message: `Choose ${requirement.remaining} more course(s) from the approved list.`,
          remaining: requirement.remaining,
          options: requirement.options ?? []
        };
  
      case "creditsFromCourseList":
        return {
          priority: "medium",
          category: requirement.name,
          message: `Complete ${requirement.creditsRemaining} more credit(s) for ${requirement.name}.`,
          remainingCredits: requirement.creditsRemaining,
          options: requirement.options ?? []
        };
  
      case "courseCountByFilter":
        return {
          priority: "medium",
          category: requirement.name,
          message: `Complete ${requirement.remaining} more course(s) for ${requirement.name}.`,
          remaining: requirement.remaining,
          note: requirement.note
        };
  
      case "wqb":
        return buildWQBRecommendation(requirement);
  
      default:
        return {
          priority: "medium",
          category: requirement.name ?? "Requirement",
          message: `You still have remaining work for ${requirement.name ?? "this requirement"}.`
        };
    }
  };

  const buildWQBRecommendation = (wqb) => {
    const messages = [];
  
    if (!wqb.writing?.isMet) {
      messages.push({
        priority: "high",
        category: "WQB - Writing",
        message: wqb.writing.hasUpperDivInMajor
          ? "Complete one more Writing course."
          : "Complete an upper-division Writing course in your major."
      });
    }
  
    if (!wqb.quantitative?.isMet) {
      messages.push({
        priority: "medium",
        category: "WQB - Quantitative",
        message: "Complete more Quantitative credits.",
        remainingCredits: Math.max(
          0,
          wqb.quantitative.required - wqb.quantitative.completed
        )
      });
    }
  
    if (!wqb.breadth?.science?.isMet) {
      messages.push({
        priority: "medium",
        category: "WQB - Breadth Science",
        message: `Complete ${wqb.breadth.science.required - wqb.breadth.science.completed} more Science breadth credit(s).`
      });
    }
  
    if (!wqb.breadth?.socialScience?.isMet) {
      messages.push({
        priority: "medium",
        category: "WQB - Breadth Social Science",
        message: `Complete ${wqb.breadth.socialScience.required - wqb.breadth.socialScience.completed} more Social Science breadth credit(s).`
      });
    }
  
    if (!wqb.breadth?.humanities?.isMet) {
      messages.push({
        priority: "medium",
        category: "WQB - Breadth Humanities",
        message: `Complete ${wqb.breadth.humanities.required - wqb.breadth.humanities.completed} more Humanities breadth credit(s).`
      });
    }
  
    return messages;
  };

/**
 * Detect potential concentration
 */
const detectPotentialConcentration = (courses, degreeRules) => {
    if (!degreeRules.concentrations?.length) return null;
  
    const all = courses.filter(
      c => c.status === "completed" || c.status === "pass" || c.status === "in-progress"
    );
  
    for (const concentration of degreeRules.concentrations) {
      const taken = concentration.courses.filter(code =>
        all.some(c => c.courseCode === code)
      );
  
      const remaining = concentration.courses.filter(code =>
        !all.some(c => c.courseCode === code)
      );
  
      if (taken.length >= concentration.courses.length - 1) {
        return {
          name: concentration.name,
          progress: `${taken.length}/${concentration.courses.length} courses`,
          remaining
        };
      }
    }
  
    return null;
  };