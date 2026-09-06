import { createRequire } from "module";
const require = createRequire(import.meta.url);

const WQBCourse = require("../../../models/wqbCourse")

export async function evaluateRequirement({ requirement, completed, inProgress, degreeRules }) {
    switch (requirement.type) {
        case "allCourses":
            return checkAllCourses(requirement, completed, inProgress);

        case "chooseCourses":
            return checkChooseCourses(requirement, completed, inProgress);

        case "creditsFromCourseList":
            return checkCreditsFromCourseList(requirement, completed, inProgress);

        case "courseCountByFilter":
            return checkCourseCountByFilter(requirement, completed, inProgress);

        case "wqb":
            return checkWQB(requirement, completed, inProgress, degreeRules);
        case "requirementGroup":
            return checkRequirementGroup(requirement, completed, inProgress, degreeRules);
        default:
            throw new Error(`Unknown requirement type: ${requirement.type}`);
    }
}

function checkAllCourses(requirement, completed, inProgress) {
    const completedCodes = completed.map(c => c.courseCode);
    const inProgressCodes = inProgress.map(c => c.courseCode);

    const status = requirement.courses.map(code => ({
        course: code,
        completed: completedCodes.includes(code),
        inProgress: inProgressCodes.includes(code),
        grade: completed.find(c => c.courseCode === code)?.grade ?? null
    }));

    return {
        id: requirement.id,
        name: requirement.name,
        progressUnit: requirement.progressUnit,
        required: requirement.courses.length,
        completed: status.filter(s => s.completed).length,
        inProgress: status.filter(s => s.inProgress).length,
        isMet: status.every(s => s.completed),
        status,
        missing: status
            .filter(s => !s.completed && !s.inProgress)
            .map(s => s.course)
    };
}

function checkChooseCourses(requirement, completed, inProgress) {
    const all = [...completed, ...inProgress];

    const taken = all.filter(c =>
        requirement.courses.includes(c.courseCode)
    );

    const completedOnly = completed.filter(c =>
        requirement.courses.includes(c.courseCode)
    );

    return {
        id: requirement.id,
        type: requirement.type,
        name: requirement.name,
        progressUnit: requirement.progressUnit,
        required: requirement.choose,
        completed: completedOnly.length,
        inProgress: taken.length - completedOnly.length,
        isMet: completedOnly.length >= requirement.choose,
        options: requirement.courses,

        courses: taken.map(c => ({
            code: c.courseCode,
            name: c.courseName,
            credits: c.credits,
            grade: c.grade,
            status: c.status
        })),

        remaining: Math.max(0, requirement.choose - completedOnly.length)
    };
}

function checkCreditsFromCourseList(requirement, completed, inProgress) {
    const all = [...completed, ...inProgress];

    const matches = all.filter(c => {
        const inList = requirement.courses.includes(c.courseCode);

        const levelOk = requirement.minLevel
            ? c.courseLevel >= requirement.minLevel
            : true;

        return inList && levelOk;
    });

    const completedMatches = completed.filter(c => {
        const inList = requirement.courses.includes(c.courseCode);
        const levelOk = requirement.minLevel
            ? c.courseLevel >= requirement.minLevel
            : true;

        return inList && levelOk;
    });

    const creditsCompleted = completedMatches.reduce(
        (sum, c) => sum + c.credits,
        0
    );

    const creditsTotal = matches.reduce(
        (sum, c) => sum + c.credits,
        0
    );

    return {
        id: requirement.id,
        name: requirement.name,
        progressUnit: requirement.progressUnit,
        creditsRequired: requirement.creditsRequired,
        creditsCompleted,
        creditsInProgress: creditsTotal - creditsCompleted,
        isMet: creditsCompleted >= requirement.creditsRequired,
        options: requirement.courses,
        creditsRemaining: Math.max(
            0,
            requirement.creditsRequired - creditsCompleted
        ),

        courses: matches.map(c => ({
            code: c.courseCode,
            credits: c.credits,
            grade: c.grade,
            status: c.status
        }))
    };
}


function checkCourseCountByFilter(requirement, completed, inProgress) {
    const { filter } = requirement;
    const all = [...completed, ...inProgress];

    const matches = all.filter(c => {
        if (filter.faculty && c.faculty !== filter.faculty) return false;
        if (filter.level && c.courseLevel !== filter.level) return false;
        if (filter.minCredits && c.credits < filter.minCredits) return false;
        if (filter.excludeCourses?.includes(c.courseCode)) return false;

        return true;
    });

    const completedMatches = completed.filter(c => {
        if (filter.faculty && c.faculty !== filter.faculty) return false;
        if (filter.level && c.courseLevel !== filter.level) return false;
        if (filter.minCredits && c.credits < filter.minCredits) return false;
        if (filter.excludeCourses?.includes(c.courseCode)) return false;

        return true;
    });

    return {
        id: requirement.id,
        name: requirement.name,
        progressUnit: requirement.progressUnit,
        required: requirement.countRequired,
        completed: completedMatches.length,
        inProgress: matches.length - completedMatches.length,
        isMet: completedMatches.length >= requirement.countRequired,
        options: requirement.courses,

        remaining: Math.max(
            0,
            requirement.countRequired - completedMatches.length
        ),

        courses: matches.map(c => ({
            code: c.courseCode,
            credits: c.credits,
            status: c.status
        }))
    };
}


async function checkWQB(requirement, completed, inProgress, degreeRules) {
    const result = await og_checkWQB(completed, inProgress);
    const { writing, quantitative, breadth } = result;
  
    const children = [
      {
        id: "wqb-writing",
        name: "Writing",
        type: "subRequirement",
        progressUnit: "credits",
        creditsRequired: 6,
        creditsCompleted: writing.completed,
        isMet: writing.isMet,
        note: writing.hasUpperDivInMajor
          ? undefined
          : "Requires upper division writing in major",
        courses: writing.courses
      },
      {
        id: "wqb-quantitative",
        name: "Quantitative",
        type: "subRequirement",
        progressUnit: "credits",
        creditsRequired: 6,
        creditsCompleted: quantitative.completed,
        isMet: quantitative.isMet,
        courses: quantitative.courses
      },
      {
        id: "wqb-breadth-science",
        name: "Breadth Science",
        type: "subRequirement",
        progressUnit: "credits",
        creditsRequired: 6,
        creditsCompleted: breadth.science.completed,
        isMet: breadth.science.isMet,
        courses: breadth.science.courses
      },
      {
        id: "wqb-breadth-social",
        name: "Breadth Social Science",
        type: "subRequirement",
        progressUnit: "credits",
        creditsRequired: 6,
        creditsCompleted: breadth.socialScience.completed,
        isMet: breadth.socialScience.isMet,
        courses: breadth.socialScience.courses
      },
      {
        id: "wqb-breadth-humanities",
        name: "Breadth Humanities",
        type: "subRequirement",
        progressUnit: "credits",
        creditsRequired: 6,
        creditsCompleted: breadth.humanities.completed,
        isMet: breadth.humanities.isMet,
        courses: breadth.humanities.courses
      },
      {
        id: "wqb-additional",
        name: "Additional Breadth",
        type: "subRequirement",
        progressUnit: "credits",
        creditsRequired: 6,
        creditsCompleted: breadth.additional.completed,
        isMet: breadth.additional.isMet,
        courses: breadth.additional.courses
      }
    ];
  
    // total credits
    const creditsCompleted = children.reduce(
      (sum, c) => sum + (c.creditsCompleted ?? 0),
      0
    );
  
    const creditsRequired = children.reduce(
      (sum, c) => sum + (c.creditsRequired ?? 0),
      0
    );
  
    return {
        id: requirement.id,
        type: "requirementGroup",
        name: requirement.name,
        progressUnit: "credits",
        creditsRequired,
        creditsCompleted,
        children,
        isMet: children.every(child => child.isMet)
      };
  }

async function checkRequirementGroup(requirement, completed, inProgress, degreeRules) {
    const childrenResults = [];
  
    for (const child of requirement.children) {
      const result = await evaluateRequirement({
        requirement: child,
        completed,
        inProgress,
        degreeRules
      });
  
      childrenResults.push(result);
    }
  
    const isMet = childrenResults.every(child => child.isMet);
  
    return {
      id: requirement.id,
      type: "requirementGroup",
      name: requirement.name,
      children: childrenResults,
      isMet
    };
  }

/**
 * Check WQB Requirements
 */

/*
WQB Helpers
*/
const norm = (code) => {
    return String(code ?? "").trim().toUpperCase().replace(/\s+/g, " ");
}

// Map for new set of completed courses
async function getWqbMapForCompleted(completed) {
    const courseNumbers = [...new Set(completed.map(c => norm(c.courseCode)))];

    const docs = await WQBCourse.find(
        { courseNumber: { $in: courseNumbers } },
        { courseNumber: 1, designations: 1, _id: 0 }
    ).lean();

    const map = new Map();
    for (const d of docs) map.set(d.courseNumber, d.designations || []);
    return map;
}

// Check if includes tags
const hasTag = (tags, t) => {
    return (tags || []).includes(t);
}


const og_checkWQB = async (completed, inProgress) => {
    // Include completed + inprogress
    const allCourses = [...completed, ...inProgress];

    // Writing courses - keep full course objects
    const wqbMap = await getWqbMapForCompleted(allCourses)

    const wCourses = allCourses.filter(c => {
        const tags = wqbMap.get(norm(c.courseCode));
        return hasTag(tags, "W") && (c.courseCode.includes("IAT")); // Hard code in IAT writing courses
    });
    // 309W check
    const upperDivW = wCourses.some(c =>
        c.faculty === 'IAT' && c.courseLevel >= 300
    );

    // Filtered out IAT
    const _courses = allCourses.filter(c => !c.courseCode.includes("IAT"))

    // Quant req
    const qCourses = _courses.filter(c => {
        const tags = wqbMap.get(norm(c.courseCode));
        return hasTag(tags, "Q");
    });

    // Breadth requirements
    const bSci = _courses.filter(c => {
        const tags = wqbMap.get(norm(c.courseCode));
        return hasTag(tags, "B-SCI");
    });

    const bSoc = _courses.filter(c => {
        const tags = wqbMap.get(norm(c.courseCode));
        return hasTag(tags, "B-SOC");
    });

    const bHum = _courses.filter(c => {
        const tags = wqbMap.get(norm(c.courseCode));
        return hasTag(tags, "B-HUM");
    });

    const breadthCourses = [...bSci, ...bSoc, ...bHum, ...qCourses, ...wCourses];

    return {
        writing: {
            required: 6,
            completed: wCourses.reduce((sum, c) => sum + c.credits, 0),
            progressUnit: "credits",
            isMet: wCourses.length >= 2 && upperDivW,
            hasUpperDivInMajor: upperDivW,
            courses: wCourses.map(c => ({
                code: c.courseCode,
                name: c.courseName,
                credits: c.credits,
                grade: c.grade,
                // Extract year from term string (e.g., "2021 Summer" -> 2021)
                year: parseInt(c.term.split(' ')[0]),
                // Extract season from term string (e.g., "2021 Summer" -> "Summer")
                season: c.term.split(' ')[1],
                level: c.courseLevel
            }))
        },
        quantitative: {
            required: 6,
            progressUnit: "credits",
            completed: qCourses.reduce((sum, c) => sum + c.credits, 0),
            isMet: qCourses.reduce((sum, c) => sum + c.credits, 0) >= 6,
            courses: qCourses.map(c => ({
                code: c.courseCode,
                name: c.courseName,
                credits: c.credits,
                grade: c.grade,
                year: parseInt(c.term.split(' ')[0]),
                term: c.term.split(' ')[1],
                level: c.courseLevel
            }))
        },
        breadth: {
            science: {
                required: 6,
                progressUnit: "credits",
                completed: bSci.reduce((sum, c) => sum + c.credits, 0),
                isMet: bSci.reduce((sum, c) => sum + c.credits, 0) >= 6,
                courses: bSci.map(c => ({
                    code: c.courseCode,
                    name: c.courseName,
                    credits: c.credits,
                    grade: c.grade,
                    year: parseInt(c.term.split(' ')[0]),
                    term: c.term.split(' ')[1],
                    level: c.courseLevel
                }))
            },
            socialScience: {
                required: 6,
                progressUnit: "credits",
                completed: bSoc.reduce((sum, c) => sum + c.credits, 0),
                isMet: bSoc.reduce((sum, c) => sum + c.credits, 0) >= 6,
                courses: bSoc.map(c => ({
                    code: c.courseCode,
                    name: c.courseName,
                    credits: c.credits,
                    grade: c.grade,
                    year: parseInt(c.term.split(' ')[0]),
                    term: c.term.split(' ')[1],
                    level: c.courseLevel
                }))
            },
            humanities: {
                required: 6,
                progressUnit: "credits",
                completed: bHum.reduce((sum, c) => sum + c.credits, 0),
                isMet: bHum.reduce((sum, c) => sum + c.credits, 0) >= 6,
                courses: bHum.map(c => ({
                    code: c.courseCode,
                    name: c.courseName,
                    credits: c.credits,
                    grade: c.grade,
                    term: c.term,
                    year: parseInt(c.term.split(' ')[0]),
                    season: c.term.split(' ')[1],
                    level: c.courseLevel
                }))
            },
            additional: {
                required: 6,
                progressUnit: "credits",
                completed: breadthCourses.reduce((sum, c) => sum + c.credits, 0) -
                    bSci.reduce((sum, c) => sum + c.credits, 0) -
                    bSoc.reduce((sum, c) => sum + c.credits, 0) -
                    bHum.reduce((sum, c) => sum + c.credits, 0),
                isMet: true, // hard coded isMet for additional lmfao
                courses: breadthCourses
                    .filter(c =>
                        !bSci.includes(c) &&
                        !bSoc.includes(c) &&
                        !bHum.includes(c) &&
                        !c.courseCode.includes("IAT")
                    )
                    .map(c => ({
                        code: c.courseCode,
                        name: c.courseName,
                        credits: c.credits,
                        grade: c.grade,
                        year: parseInt(c.term.split(' ')[0]),
                        term: c.term.split(' ')[1],
                        level: c.courseLevel
                    }))
            }
        }
    };
};
