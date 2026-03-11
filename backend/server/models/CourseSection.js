// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
const mongoose = require("mongoose");

// =========================
// MONGOOSE SCHEMA
// =========================
const InstructorSchema = new mongoose.Schema(
  {
    profileUrl: String,
    commonName: String,
    firstName: String,
    lastName: String,
    phone: String,
    roleCode: String,
    name: String,
    officeHours: String,
    office: String,
    email: String,
  },
  { _id: false }
);

const ScheduleSchema = new mongoose.Schema(
  {
    endDate: String,
    campus: String,
    days: String,
    sectionCode: String,
    startTime: String,
    isExam: Boolean,
    endTime: String,
    startDate: String,
  },
  { _id: false }
);

const RequiredTextSchema = new mongoose.Schema(
  {
    details: String,
  },
  { _id: false }
);

const CourseInfoSchema = new mongoose.Schema(
  {
    notes: String,
    deliveryMethod: String,
    description: String,
    section: String,
    units: String,
    title: String,
    type: String,
    classNumber: String,
    departmentalUgradNotes: String,
    prerequisites: String,
    number: String,
    requiredReadingNotes: String,
    registrarNotes: String,
    shortNote: String,
    outlinePath: String,
    term: String,
    gradingNotes: String,
    corequisites: String,
    dept: String,
    degreeLevel: String,
    specialTopic: String,
    courseDetails: String,
    materials: String,
    name: String,
    designation: String,
  },
  { _id: false }
);

const CourseSectionSchema = new mongoose.Schema(
  {
    year: { type: String, required: true },
    term: { type: String, required: true }, // e.g. fall
    termLabel: String, // e.g. Fall 2025

    departmentCode: { type: String, required: true }, // CMPT
    departmentValue: String, // cmpt
    departmentName: String, // Computing Science

    courseNumber: { type: String, required: true }, // 120
    courseValue: String, // 120 / 105w
    courseTitle: String, // Intro to...
    courseCode: { type: String, required: true }, // CMPT 120

    section: { type: String, required: true }, // D100
    sectionValue: String, // d100
    classType: String,
    sectionCode: String, // LEC
    associatedClass: String,

    info: CourseInfoSchema,
    instructor: [InstructorSchema],
    courseSchedule: [ScheduleSchema],
    examSchedule: [ScheduleSchema],
    requiredText: [RequiredTextSchema],

    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One document per unique offering section
CourseSectionSchema.index(
  { year: 1, term: 1, departmentCode: 1, courseNumber: 1, section: 1 },
  { unique: true }
);

module.exports = mongoose.model('CourseSection', CourseSectionSchema, "coursesections");

