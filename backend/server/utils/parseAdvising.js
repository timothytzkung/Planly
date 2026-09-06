const fs = require("fs");
const { PDFParse } = require('pdf-parse')

async function parseTranscript(filePath) {
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ url: filePath });
    const data = await parser.getText();

    const text = data.text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .trim();

    const result = {
        student: {},
        secondaryCourses: [],
        transferCourses: [],
        summary: {},
        terms: [],
        wqbCourses: [],
    };

    // Student info
    result.student.name = text.match(/^(.+?)\nAddr:/)?.[1]?.trim();
    result.student.studentId = text.match(/Student ID:\s*(\d+)/)?.[1];
    result.student.email = text.match(/Email:\s*([^\s]+)/)?.[1];
    result.student.phone = text.match(/Phone:\s*([^\n]+)/)?.[1]?.trim();

    // Summary stats
    result.summary.totalUnits = Number(text.match(/Total Units:\s*([\d.]+)/)?.[1]);
    result.summary.upperDivisionUnits = Number(text.match(/Total UD Units:\s*([\d.]+)/)?.[1]);
    result.summary.cumGpa = Number(text.match(/Cum GPA:\s*\([^)]+\)\s*([\d.]+)/)?.[1]);
    result.summary.cumUdGpa = Number(text.match(/Cum UDGPA:\s*\([^)]+\)\s*([\d.]+)/)?.[1]);


    // SECONDARY COURSES
    const secondaryBlock = text.match(
        /SECONDARY COURSES - Interim[\s\S]*?(?=\nUNDERGRADUATE CAREER)/
    )?.[0];

    if (secondaryBlock) {
        const lines = secondaryBlock.split("\n").map(l => l.trim());

        for (const line of lines) {
            const match = line.match(
                /^([A-Z0-9]+)\s+([A-Z0-9]+(?:\s+[A-Z0-9]+)?)\s+([A-F][+-]?|XMT|A)\s*([\d]*)\s+(.+)$/
            );

            if (match && !line.startsWith("Sub ")) {
                result.secondaryCourses.push({
                    subject: match[1],
                    courseNumber: match[2],
                    grade: match[3],
                    percent: match[4] ? Number(match[4]) : null,
                    institution: match[5].trim()
                });
            }
        }
    }

    // TRANSFER COURSES
    const transferBlock = text.match(
        /TRANSFER COURSES[\s\S]*?(?=\nProgram:)/
    )?.[0];

    if (transferBlock) {
        const lines = transferBlock.split("\n").map(l => l.trim());

        for (const line of lines) {
            const match = line.match(
                /^([A-Z]+)\s+([A-Z0-9]+)\s+([\d.]+)\s+([A-F][+-]?|P|TR-C|WD)\s+(\S+)\s+(\d{4})\s+(.+)$/
            );

            if (match && !line.startsWith("Sub ")) {
                result.transferCourses.push({
                    subject: match[1],
                    catalogNumber: match[2],
                    units: Number(match[3]),
                    grade: match[4],
                    gradePoints: match[5] === "TR-C" ? null : Number(match[5]),
                    termCode: match[6],
                    institution: match[7].trim()
                });
            }
        }
    }

    // Term-by-term courses
    const termRegex =
        /(\d{4}\s+(?:Spring|Summer|Fall))(?:\s+Good Academic Standing[^\n]*)?\n([\s\S]*?)(?=\n\d{4}\s+(?:Spring|Summer|Fall)|\nTOTAL UNITS|\nEND OF UNDERGRADUATE)/g;

    let termMatch;

    while ((termMatch = termRegex.exec(text)) !== null) {
        const termName = termMatch[1];
        const block = termMatch[2];

        const term = {
            term: termName,
            courses: [],
            termGpa: null,
            cgpa: null,
            udgpa: null,
            cumulativeUdgpa: null
        };

        const lines = block.split("\n").map(l => l.trim()).filter(Boolean);

        for (const line of lines) {
            // Example:
            // IAT 355 4.0 A+ 17.32 1 Online Perm.Dt:03-11-2025
            const courseMatch = line.match(
                /^([A-Z]{2,5})\s+([A-Z]?\d{2,3}[A-Z]?)\s+([\d.]+)\s+([A-F][+-]?|P|WD)?\s*([\d.]+)?\s*(.*)$/
            );

            if (courseMatch) {
                term.courses.push({
                    subject: courseMatch[1],
                    catalogNumber: courseMatch[2],
                    courseCode: `${courseMatch[1]} ${courseMatch[2]}`,
                    units: Number(courseMatch[3]),
                    grade: courseMatch[4] || null,
                    gradePoints: courseMatch[5] ? Number(courseMatch[5]) : null,
                    notes: courseMatch[6]?.trim() || null
                });
            }

            const gpaMatch = line.match(
                /Term GPA\s*\(\s*([\d.]+)\/\s*([\d.]+)\)([\d.]+)CGPA\s*\(\s*([\d.]+)\/\s*([\d.]+)\)([\d.]+)/
            );

            if (gpaMatch) {
                term.termGpa = Number(gpaMatch[3]);
                term.cgpa = Number(gpaMatch[6]);
            }

            const udgpaMatch = line.match(
                /UDGPA\s*\(\s*([\d.]+)\/\s*([\d.]+)\)([\d.]+)CUDGPA\s*\(\s*([\d.]+)\/\s*([\d.]+)\)([\d.]+)/
            );

            if (udgpaMatch) {
                term.udgpa = Number(udgpaMatch[3]);
                term.cumulativeUdgpa = Number(udgpaMatch[6]);
            }
        }

        if (term.courses.length > 0) {
            result.terms.push(term);
        }
    }

    // WQB section
    const wqbBlock = text.match(/WQB COURSES[\s\S]*?End of Student/)?.[0];

    if (wqbBlock) {
        const lines = wqbBlock.split("\n").map(l => l.trim());

        for (const line of lines) {
            const match = line.match(
                /^(\d{4})\s+([A-Z]{2,5})\s+([A-Z]?\d{2,3}[A-Z]?)\s+([A-F][+-]?|P|WD)\s+([\d.]+)\s+(\d+)\s+([A-Za-z/-]+)\s+(\w+)/
            );

            if (match) {
                result.wqbCourses.push({
                    termCode: match[1],
                    subject: match[2],
                    catalogNumber: match[3],
                    courseCode: `${match[2]} ${match[3]}`,
                    grade: match[4],
                    units: Number(match[5]),
                    requirementNumber: match[6],
                    designation: match[7],
                    type: match[8]
                });
            }
        }
    }

    return result;
}

parseTranscript("../files/transcript_advising.pdf").then(json => {
    fs.writeFileSync("transcript.json", JSON.stringify(json, null, 2));
    console.log(JSON.stringify(json, null, 2));
});