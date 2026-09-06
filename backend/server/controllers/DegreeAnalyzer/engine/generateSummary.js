

// Helper
const sumCredits = (courses) => {
    return courses.reduce((sum, c) => sum + Number(c.credits || 0), 0);
  };


// Main summary generator
export const generateSummary = (courses, gpa, requirements, degreeRules) => {
    console.log(requirements)
    const completed = courses.filter(
      c => c.status === "completed" || c.status === "pass"
    );
  
    const inProgress = courses.filter(
      c => c.status === "in-progress"
    );
  
    const totalCreditsRequired = degreeRules.minimums.totalCredits ?? 120;
  
    const creditsCompleted = sumCredits(completed);
    const creditsInProgress = sumCredits(inProgress);
    const creditsTotal = creditsCompleted + creditsInProgress;
    const creditsRemaining = Math.max(0, totalCreditsRequired - creditsTotal);
  
    return {
      studentStatus: determineStudentStatus({
        creditsCompleted,
        gpa
      }),
  
      creditsCompleted,
      creditsInProgress,
      creditsRemaining,
  
      percentComplete: Math.min(
        100,
        Math.round((creditsCompleted / totalCreditsRequired) * 100)
      ),
  
      gpa: {
        overall: gpa.overall.gpa,
        major: gpa.major.gpa,
        meetsRequirements:
          gpa.overall.meetsMinimum && gpa.major.meetsMinimum
      },
  
      requirements: {
        total: Object.keys(requirements).length,
        completed: Object.values(requirements).filter(r => r.isMet).length,
        remaining: Object.values(requirements).filter(r => !r.isMet).length
      },
  
      estimatedGraduation: estimateGraduation(creditsRemaining),
  
      termsCompleted: new Set(completed.map(c => c.term)).size
    };
  };

/**
 * Determine student status
 */
const determineStudentStatus = ({ creditsCompleted, gpa }) => {
    if (!gpa.overall.meetsMinimum || !gpa.major.meetsMinimum) {
      return "Academic Warning";
    }
  
    if (creditsCompleted >= 90) return "Year 4+";
    if (creditsCompleted >= 60) return "Year 3";
    if (creditsCompleted >= 30) return "Year 2";
  
    return "Year 1";
  };
/**
 * Estimate graduation
 */
const estimateGraduation = (creditsRemaining, creditsPerTerm = 12) => {
    if (creditsRemaining <= 0) return "Eligible to Graduate";
  
    const termsNeeded = Math.ceil(creditsRemaining / creditsPerTerm);
    const seasons = ["Spring", "Summer", "Fall"];
  
    const currentDate = new Date();
    let year = currentDate.getFullYear();
    const month = currentDate.getMonth();
  
    let seasonIndex;
  
    if (month >= 0 && month <= 3) {
      seasonIndex = 0;
    } else if (month >= 4 && month <= 7) {
      seasonIndex = 1;
    } else {
      seasonIndex = 2;
    }
  
    for (let i = 0; i < termsNeeded; i++) {
      seasonIndex++;
  
      if (seasonIndex >= seasons.length) {
        seasonIndex = 0;
        year++;
      }
    }
  
    return `${seasons[seasonIndex]} ${year}`;
  };