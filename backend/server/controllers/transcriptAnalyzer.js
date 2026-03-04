
// Analyzes transcripts; hard coded for IAT BSc
/*
TODO;

Change breadth requirements to fetch from SFU API
*/
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Course Model
const WQBCourse = require("../models/wqbCourse")


// Main runner function
export const transcriptAnalyzer = async(transcriptData) => {
    const courses = parseTranscriptData(transcriptData);

    // Calculate GPAs
    const gpaResults = calculateGPAs(courses);

    // Check requirements
    const requirementChecks = await checkAllRequirements(courses);

    // Generate comprehensive report
    return {
        summary: generateSummary(courses, gpaResults, requirementChecks),
        gpa: gpaResults,
        requirements: requirementChecks,
        recommendations: generateRecommendations(requirementChecks, courses),
        timeline: generateTimeline(courses)
    };
};

/**
 * Parse transcript with grades
 */
const parseTranscriptData = (transcriptData) => {
    const courses = [];

    for (const [term, termCourses] of Object.entries(transcriptData)) {
        for (const course of termCourses) {
            if (course.status === 'withdrawn') continue;

            const courseCode = `${course.faculty} ${course['course-number']}`;
            const courseLevel = Math.floor(parseInt(course['course-number']) / 100) * 100;

            courses.push({
                courseCode,
                courseName: course['course-name'],
                faculty: course.faculty,
                courseNumber: course['course-number'],
                credits: course.credits,
                grade: course.grade,
                courseLevel,
                term,
                status: course.status,
                classAverage: course['class-average'],
                classSize: course['class-size']
            });
        }
    }

    return courses;
};

/**
 * Calculate GPAs with actual grades
 */
const calculateGPAs = (courses) => {
    const gradePoints = {
        'A+': 4.33, 'A': 4.0, 'A-': 3.67,
        'B+': 3.33, 'B': 3.0, 'B-': 2.67,
        'C+': 2.33, 'C': 2.0, 'C-': 1.67,
        'D': 1.0, 'F': 0.0
    };

    const completedWithGrades = courses.filter(c =>
        (c.status === 'completed' || c.status === 'pass') &&
        c.grade !== 'P' &&
        c.grade !== null
    );

    const iatCourses = completedWithGrades.filter(c => c.faculty === 'IAT');

    // Calculate overall GPA
    const overallGradePoints = completedWithGrades.reduce((sum, c) => {
        const points = gradePoints[c.grade] || 0;
        return sum + (points * c.credits);
    }, 0);

    const overallCredits = completedWithGrades.reduce((sum, c) => sum + c.credits, 0);
    const overallGPA = overallCredits > 0 ? overallGradePoints / overallCredits : 0;

    // Calculate IAT GPA
    const iatGradePoints = iatCourses.reduce((sum, c) => {
        const points = gradePoints[c.grade] || 0;
        return sum + (points * c.credits);
    }, 0);

    const iatCredits = iatCourses.reduce((sum, c) => sum + c.credits, 0);
    const iatGPA = iatCredits > 0 ? iatGradePoints / iatCredits : 0;

    // Calculate term-by-term GPA
    const termGPAs = {};
    const uniqueTerms = [...new Set(courses.map(c => c.term))];

    for (const term of uniqueTerms) {
        const termCourses = completedWithGrades.filter(c => c.term === term);
        const termPoints = termCourses.reduce((sum, c) => {
            const points = gradePoints[c.grade] || 0;
            return sum + (points * c.credits);
        }, 0);
        const termCredits = termCourses.reduce((sum, c) => sum + c.credits, 0);
        termGPAs[term] = termCredits > 0 ? (termPoints / termCredits).toFixed(2) : 'N/A';
    }

    return {
        overall: {
            gpa: parseFloat(overallGPA.toFixed(2)),
            credits: overallCredits,
            courses: completedWithGrades.length,
            meetsMinimum: overallGPA >= 2.0
        },
        iat: {
            gpa: parseFloat(iatGPA.toFixed(2)),
            credits: iatCredits,
            courses: iatCourses.length,
            meetsMinimum: iatGPA >= 2.4
        },
        byTerm: termGPAs,
        gradeDistribution: calculateGradeDistribution(completedWithGrades)
    };
};

/**
 * Calculate grade distribution
 */
const calculateGradeDistribution = (courses) => {
    const distribution = {
        'A+': 0, 'A': 0, 'A-': 0,
        'B+': 0, 'B': 0, 'B-': 0,
        'C+': 0, 'C': 0, 'C-': 0,
        'D': 0, 'F': 0
    };

    courses.forEach(c => {
        if (distribution.hasOwnProperty(c.grade)) {
            distribution[c.grade]++;
        }
    });

    return distribution;
};

/**
 * Check all requirements against transcript
 */
const checkAllRequirements = async(courses) => {
    const completedCourses = courses.filter(c => c.status === 'completed' || c.status === 'pass');
    const inProgressCourses = courses.filter(c => c.status === 'in-progress');

    return {
        lowerDivisionRequired: checkLowerDivRequired(completedCourses, inProgressCourses),
        lowerDivisionElectives: checkLowerDivElectives(completedCourses, inProgressCourses),
        upperDivisionRequired: checkUpperDivRequired(completedCourses, inProgressCourses),
        upperDivisionScience: checkUpperDivScience(completedCourses, inProgressCourses),
        fourHundredLevel: check400Level(completedCourses, inProgressCourses),
        wqb: await checkWQB(completedCourses, inProgressCourses),
        overall: checkOverallProgress(completedCourses, inProgressCourses)
    };
};

/**
 * Check Lower Division Required Courses
 */
const checkLowerDivRequired = (completed, inProgress) => {
    const required = [
        'CMPT 120', 'IAT 100', 'IAT 102', 'IAT 103W',
        'IAT 106', 'IAT 167', 'MACM 101', 'IAT 206W'
    ];

    const allCourses = [...completed, ...inProgress];
    const completedCodes = completed.map(c => c.courseCode);
    const allCodes = allCourses.map(c => c.courseCode);

    const status = required.map(code => ({
        course: code,
        completed: completedCodes.includes(code),
        inProgress: allCodes.includes(code) && !completedCodes.includes(code),
        grade: completed.find(c => c.courseCode === code)?.grade
    }));

    const completedCount = status.filter(s => s.completed).length;
    const totalCount = status.filter(s => s.completed || s.inProgress).length;

    return {
        name: 'Lower Division - Required Courses',
        required: required.length,
        completed: completedCount,
        inProgress: totalCount - completedCount,
        creditsRequired: 24, // 8 courses x 3 credits
        creditsCompleted: completed.filter(c => required.includes(c.courseCode))
            .reduce((sum, c) => sum + c.credits, 0),
        isMet: completedCount === required.length,
        status: status,
        missing: status.filter(s => !s.completed && !s.inProgress).map(s => s.course)
    };
};

/**
 * Check Lower Division Electives
 */
const checkLowerDivElectives = (completed, inProgress) => {
    const electives = [
        'IAT 201', 'IAT 202', 'IAT 222', 'IAT 233',
        'IAT 235', 'IAT 238', 'IAT 265', 'IAT 267'
    ];

    const allCourses = [...completed, ...inProgress];
    const takenElectives = allCourses.filter(c => electives.includes(c.courseCode));
    const completedElectives = completed.filter(c => electives.includes(c.courseCode));

    return {
        name: 'Lower Division - Elective Courses',
        required: 5,
        completed: completedElectives.length,
        inProgress: takenElectives.length - completedElectives.length,
        creditsRequired: 15,
        creditsCompleted: completedElectives.reduce((sum, c) => sum + c.credits, 0),
        isMet: completedElectives.length >= 5,
        courses: takenElectives.map(c => ({
            code: c.courseCode,
            name: c.courseName,
            credits: c.credits,
            grade: c.grade,
            status: c.status
        })),
        missing: 5 - completedElectives.length
    };
};

/**
 * Check Upper Division Required (IAT 309W)
 */
const checkUpperDivRequired = (completed, inProgress) => {
    const has309W = completed.some(c => c.courseCode === 'IAT 309W');
    const inProgress309W = inProgress.some(c => c.courseCode === 'IAT 309W');

    return {
        name: 'Upper Division - Required Course (IAT 309W)',
        required: 1,
        completed: has309W ? 1 : 0,
        inProgress: inProgress309W ? 1 : 0,
        creditsRequired: 4,
        creditsCompleted: has309W ? 4 : 0,
        isMet: has309W,
        course: has309W ? completed.find(c => c.courseCode === 'IAT 309W') : null,
        note: 'Must be completed before taking 400-level courses'
    };
};

/**
 * Check Upper Division IAT Science Courses
 */
const checkUpperDivScience = (completed, inProgress) => {
    const scienceCourses = [
        'IAT 333', 'IAT 336', 'IAT 339', 'IAT 351', 'IAT 355',
        'IAT 359', 'IAT 360', 'IAT 410', 'IAT 432', 'IAT 452',
        'IAT 459', 'IAT 460', 'IAT 461', 'IAT 499'
    ];

    const allCourses = [...completed, ...inProgress];
    const takenScience = allCourses.filter(c =>
        scienceCourses.includes(c.courseCode) && c.courseLevel >= 300
    );

    const completedScience = completed.filter(c =>
        scienceCourses.includes(c.courseCode) && c.courseLevel >= 300
    );

    const creditsCompleted = completedScience.reduce((sum, c) => sum + c.credits, 0);
    const creditsTotal = takenScience.reduce((sum, c) => sum + c.credits, 0);

    return {
        name: 'Upper Division - IAT Science Courses',
        creditsRequired: 24,
        creditsCompleted,
        creditsInProgress: creditsTotal - creditsCompleted,
        isMet: creditsCompleted >= 24,
        courses: takenScience.map(c => ({
            code: c.courseCode,
            name: c.courseName,
            credits: c.credits,
            grade: c.grade,
            status: c.status
        })),
        creditsNeeded: Math.max(0, 24 - creditsCompleted)
    };
};

/**
 * Check 400-Level Requirement
 */
const check400Level = (completed, inProgress) => {
    const allCourses = [...completed, ...inProgress];
    const fourHundred = allCourses.filter(c =>
        c.faculty === 'IAT' &&
        c.courseLevel === 400 &&
        c.credits >= 3 &&
        !c.courseCode.includes('487')
    );

    const completed400 = allCourses.filter(c =>
        c.faculty === 'IAT' &&
        c.courseLevel === 400 &&
        c.credits >= 3 &&
        !c.courseCode.includes('487')
    );

    return {
        name: '400-Level IAT Courses',
        required: 2,
        completed: completed400.length,
        inProgress: fourHundred.length - completed400.length,
        isMet: completed400.length >= 2,
        courses: fourHundred.map(c => ({
            code: c.courseCode,
            name: c.courseName,
            credits: c.credits,
            grade: c.grade,
            status: c.status
        })),
        note: 'Excludes directed studies (IAT 487)'
    };
};


// Check if course exists
const getDesignations = async (courseNumber) => {
    const normalized = courseNumber.trim().toUpperCase();

    const doc = await WQBCourse.findOne(
        { courseNumber: normalized },
        { designations: 1, _id: 0 }
    ).lean();

    return doc?.designations ?? [];
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


const checkWQB = async (completed, inProgress) => {
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
    console.log(breadthCourses)

    return {
        writing: {
            required: 6,
            completed: wCourses.reduce((sum, c) => sum + c.credits, 0),
            isMet: wCourses.length >= 2 && upperDivW,
            hasUpperDivInMajor: upperDivW,
            courses: wCourses.map(c => ({
                code: c.courseCode,
                name: c.courseName,
                credits: c.credits,
                grade: c.grade,
                term: c.term,
                // Extract year from term string (e.g., "2021 Summer" -> 2021)
                year: parseInt(c.term.split(' ')[0]),
                // Extract season from term string (e.g., "2021 Summer" -> "Summer")
                season: c.term.split(' ')[1],
                level: c.courseLevel
            }))
        },
        quantitative: {
            required: 6,
            completed: qCourses.reduce((sum, c) => sum + c.credits, 0),
            isMet: qCourses.reduce((sum, c) => sum + c.credits, 0) >= 6,
            courses: qCourses.map(c => ({
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
        breadth: {
            science: {
                required: 6,
                completed: bSci.reduce((sum, c) => sum + c.credits, 0),
                isMet: bSci.reduce((sum, c) => sum + c.credits, 0) >= 6,
                courses: bSci.map(c => ({
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
            socialScience: {
                required: 6,
                completed: bSoc.reduce((sum, c) => sum + c.credits, 0),
                isMet: bSoc.reduce((sum, c) => sum + c.credits, 0) >= 6,
                courses: bSoc.map(c => ({
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
            humanities: {
                required: 6,
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
                completed: breadthCourses.reduce((sum, c) => sum + c.credits, 0) -
                    bSci.reduce((sum, c) => sum + c.credits, 0) -
                    bSoc.reduce((sum, c) => sum + c.credits, 0) -
                    bHum.reduce((sum, c) => sum + c.credits, 0),
                isMet: true,
                courses: breadthCourses
                    .filter(c =>
                        !bSci.includes(c) &&
                        !bSoc.includes(c) &&
                        !bHum.includes(c)
                    )
                    .map(c => ({
                        code: c.courseCode,
                        name: c.courseName,
                        credits: c.credits,
                        grade: c.grade,
                        term: c.term,
                        year: parseInt(c.term.split(' ')[0]),
                        season: c.term.split(' ')[1],
                        level: c.courseLevel
                    }))
            }
        }
    };
};

/**
 * Check Overall Progress
 */
const checkOverallProgress = (completed, inProgress) => {
    const totalCreditsCompleted = completed.reduce((sum, c) => sum + c.credits, 0);
    const totalCreditsInProgress = inProgress.reduce((sum, c) => sum + c.credits, 0);

    const upperDivCompleted = completed
        .filter(c => c.courseLevel >= 300)
        .reduce((sum, c) => sum + c.credits, 0);

    const upperDivInProgress = inProgress
        .filter(c => c.courseLevel >= 300)
        .reduce((sum, c) => sum + c.credits, 0);

    const upperDivIATCompleted = completed
        .filter(c => c.faculty === 'IAT' && c.courseLevel >= 300)
        .reduce((sum, c) => sum + c.credits, 0);

    const upperDivIATInProgress = inProgress
        .filter(c => c.faculty === 'IAT' && c.courseLevel >= 300)
        .reduce((sum, c) => sum + c.credits, 0);

    const upperDivIATCourseCount = completed
        .filter(c => c.faculty === 'IAT' && c.courseLevel >= 300).length;

    return {
        totalCredits: {
            required: 120,
            completed: totalCreditsCompleted,
            inProgress: totalCreditsInProgress,
            total: totalCreditsCompleted + totalCreditsInProgress,
            remaining: 120 - totalCreditsCompleted - totalCreditsInProgress,
            percentComplete: Math.round((totalCreditsCompleted / 120) * 100)
        },
        upperDivision: {
            required: 44,
            completed: upperDivCompleted,
            inProgress: upperDivInProgress,
            total: upperDivCompleted + upperDivInProgress,
            remaining: Math.max(0, 44 - upperDivCompleted - upperDivInProgress)
        },
        upperDivisionIAT: {
            unitsRequired: 32,
            unitsCompleted: upperDivIATCompleted,
            unitsInProgress: upperDivIATInProgress,
            coursesRequired: 8,
            coursesCompleted: upperDivIATCourseCount,
            meetsUnits: (upperDivIATCompleted + upperDivIATInProgress) >= 32,
            meetsCourses: upperDivIATCourseCount >= 8
        }
    };
};

/**
 * Generate summary
 */
const generateSummary = (courses, gpa, requirements) => {
    const completed = courses.filter(c => c.status === 'completed' || c.status === 'pass');

    return {
        studentStatus: determineStudentStatus(requirements, gpa),
        creditsCompleted: requirements.overall.totalCredits.completed,
        creditsInProgress: requirements.overall.totalCredits.inProgress,
        creditsRemaining: requirements.overall.totalCredits.remaining,
        percentComplete: requirements.overall.totalCredits.percentComplete,
        gpa: {
            overall: gpa.overall.gpa,
            iat: gpa.iat.gpa,
            meetsRequirements: gpa.overall.meetsMinimum && gpa.iat.meetsMinimum
        },
        estimatedGraduation: estimateGraduation(requirements.overall.totalCredits.remaining),
        termsCompleted: new Set(completed.map(c => c.term)).size
    };
};

/**
 * Determine student status
 */
const determineStudentStatus = (requirements, gpa) => {
    if (!gpa.overall.meetsMinimum || !gpa.iat.meetsMinimum) {
        return 'Academic Warning';
    }

    if (requirements.overall.totalCredits.percentComplete >= 75) {
        return 'Senior Standing';
    } else if (requirements.overall.totalCredits.completed >= 60) {
        return 'Junior Standing';
    } else if (requirements.overall.totalCredits.completed >= 30) {
        return 'Sophomore Standing';
    } else {
        return 'Freshman Standing';
    }
};

/**
 * Estimate graduation
 */
const estimateGraduation = (creditsRemaining) => {
    if (creditsRemaining <= 0) return 'Eligible to Graduate';

    const termsNeeded = Math.ceil(creditsRemaining / 12); // Assuming 12 credits/term
    const currentDate = new Date();

    // Calculate terms ahead
    const seasons = ['Spring', 'Summer', 'Fall'];
    let year = currentDate.getFullYear();

    // TODO
    /*
    Add checks for what season/term is it depending on date
    */

    let seasonIndex = 2; // Starting from Spring 2026

    for (let i = 0; i < termsNeeded; i++) {
        seasonIndex++;
        if (seasonIndex >= 3) {
            seasonIndex = 0;
            year++;
        }
    }

    return `${seasons[seasonIndex]} ${year}`;
};

/**
 * Generate recommendations
 */
const generateRecommendations = (requirements, courses) => {
    const recommendations = [];

    // Check lower div requirements
    if (!requirements.lowerDivisionRequired.isMet) {
        recommendations.push({
            priority: 'high',
            category: 'Required Courses',
            message: `Complete missing lower division required courses: ${requirements.lowerDivisionRequired.missing.join(', ')}`,
            courses: requirements.lowerDivisionRequired.missing
        });
    }

    if (!requirements.lowerDivisionElectives.isMet) {
        recommendations.push({
            priority: 'high',
            category: 'Electives',
            message: `Need ${requirements.lowerDivisionElectives.missing} more lower division elective(s)`,
            suggestion: 'Choose from: IAT 222, IAT 233, IAT 238, IAT 267'
        });
    }

    // Check science credits
    if (!requirements.upperDivisionScience.isMet) {
        recommendations.push({
            priority: 'medium',
            category: 'Science Requirements',
            message: `Need ${requirements.upperDivisionScience.creditsNeeded} more credits from IAT science courses`,
            suggestion: 'Take courses like IAT 333, IAT 351, IAT 432, IAT 452, IAT 499'
        });
    }

    // Check 400-level
    if (!requirements.fourHundredLevel.isMet) {
        recommendations.push({
            priority: 'medium',
            category: '400-Level Requirement',
            message: `Need ${2 - requirements.fourHundredLevel.completed} more 400-level IAT course(s)`,
            note: 'Must be at least 3 credits each, excluding IAT 487'
        });
    }

    // Check WQB
    if (!requirements.wqb.writing.isMet) {
        recommendations.push({
            priority: 'high',
            category: 'WQB - Writing',
            message: requirements.wqb.writing.hasUpperDivInMajor
                ? 'Need one more Writing course'
                : 'Need upper division Writing course in major (IAT 309W)'
        });
    }

    if (!requirements.wqb.quantitative.isMet) {
        recommendations.push({
            priority: 'medium',
            category: 'WQB - Quantitative',
            message: 'Need one more Quantitative course',
            suggestion: 'MATH 232 or other Q-designated course'
        });
    }

    if (!requirements.wqb.breadth.humanities.isMet) {
        recommendations.push({
            priority: 'medium',
            category: 'WQB - Breadth Humanities',
            message: `Need ${6 - requirements.wqb.breadth.humanities.completed} more credits in Humanities`,
            suggestion: 'Take B-Hum designated courses'
        });
    }

    // Check concentration progress
    const concentration = detectPotentialConcentration(courses);
    if (concentration) {
        recommendations.push({
            priority: 'low',
            category: 'Concentration',
            message: `You're on track for ${concentration.name} concentration`,
            progress: concentration.progress,
            remaining: concentration.remaining
        });
    }

    return recommendations;
};

/**
 * Detect potential concentration
 */
const detectPotentialConcentration = (courses) => {
    const completed = courses.filter(c => c.status === 'completed');
    const inProgress = courses.filter(c => c.status === 'in-progress');
    const all = [...completed, ...inProgress];

    const concentrations = {
        'Web and Mobile Development': {
            required: ['IAT 339', 'IAT 359', 'IAT 459'],
            credits: 12
        },
        'AI and Data Science': {
            required: ['IAT 355', 'IAT 360', 'IAT 460', 'IAT 461'],
            credits: 16
        }
    };

    for (const [name, req] of Object.entries(concentrations)) {
        const taken = req.required.filter(code =>
            all.some(c => c.courseCode === code)
        );

        if (taken.length >= req.required.length - 1) {
            return {
                name,
                progress: `${taken.length}/${req.required.length} courses`,
                remaining: req.required.filter(code =>
                    !all.some(c => c.courseCode === code)
                )
            };
        }
    }

    return null;
};

/**
 * Generate timeline
 */
const generateTimeline = (courses) => {
    const terms = {};

    for (const course of courses) {
        if (!terms[course.term]) {
            terms[course.term] = {
                courses: [],
                totalCredits: 0,
                completedCredits: 0,
                averageGrade: []
            };
        }

        terms[course.term].courses.push({
            code: course.courseCode,
            name: course.courseName,
            credits: course.credits,
            grade: course.grade,
            status: course.status
        });

        terms[course.term].totalCredits += course.credits;

        if (course.status === 'completed') {
            terms[course.term].completedCredits += course.credits;
            if (course.grade && course.grade !== 'P') {
                terms[course.term].averageGrade.push(course.grade);
            }
        }
    }

    return terms;
};
