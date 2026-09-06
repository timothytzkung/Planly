export const iatBa = {
    id: "iat-ba",
    name: "Interactive Arts and Technology BA",
    faculty: "IAT",
  
    minimums: {
      totalCredits: 120,
      upperDivisionCredits: 44,
      upperDivisionMajorCredits: 32,
      upperDivisionMajorCourses: 8,
      overallGPA: 2.0,
      majorGPA: 2.4
    },
  
    requirements: [
      {
        id: "lower-division-required",
        name: "Lower Division - Required Courses",
        type: "allCourses",
        progressUnit: "courses",
        courses: [
          "CMPT 120",
          "IAT 100",
          "IAT 102",
          "IAT 103W",
          "IAT 106",
          "IAT 167",
          "MATH 130",
          "IAT 206W"
        ]
      },
      {
        id: "lower-division-electives",
        name: "Lower Division - 200 Level Courses",
        type: "chooseCourses",
        progressUnit: "courses",
        choose: 5,
        courses: [
          "IAT 201",
          "IAT 202",
          "IAT 222",
          "IAT 233",
          "IAT 235",
          "IAT 238",
          "IAT 265",
          "IAT 267"
        ]
      },
      {
        id: "upper-division-required",
        name: "Upper Division - Required Course",
        type: "allCourses",
        courses: ["IAT 309W"]
      },
      {
        id: "upper-division-art",
        name: "Upper Division - IAT Art Courses",
        type: "creditsFromCourseList",
        creditsRequired: 24,
        progressUnit: "credits",
        minLevel: 300,
        courses: [
            "IAT 312",
            "IAT 313",
            "IAT 320",
            "IAT 334",
            "IAT 340",
            "IAT 343",
            "IAT 344",
            "IAT 380",
            "IAT 386",
            "IAT 431",
            "IAT 438",
            "IAT 443",
            "IAT 445",
            "IAT 480",
            "IAT 486",
            "IAT 499"
          ]
      },
      {
        id: "four-hundred-level",
        name: "400-Level IAT Courses",
        type: "courseCountByFilter",
        countRequired: 2,
        progressUnit: "courses",
        filter: {
          faculty: "IAT",
          level: 400,
          minCredits: 3,
          excludeCourses: ["IAT 487"]
        }
      },
      {
        id: "wqb",
        name: "WQB Requirements",
        type: "wqb",
        progressUnit: "credits",
        displayOrder: 6,
        accent: "breadth",
        showInPlanner: true
      }
    ],
  
    concentrations: [
        {
          id: "creative-media",
          name: "Creative Media",
          courses: ["IAT 313", "IAT 340", "IAT 344", "IAT 443"]
        },
        {
          id: "designing-interactions",
          name: "Designing Interactions",
          courses: ["IAT 333", "IAT 431", "IAT 438"]
        },
        {
          id: "xr-game-design",
          name: "Extended Reality and Game Design",
          courses: ["IAT 312", "IAT 343", "IAT 410", "IAT 445"]
        },
        {
          id: "ai-data-science",
          name: "AI and Data Science for Human-Centered Systems",
          courses: ["IAT 355", "IAT 360", "IAT 460", "IAT 461"]
        },
        {
          id: "web-mobile",
          name: "Design and Development for Web and Mobile",
          courses: ["IAT 339", "IAT 359", "IAT 459"]
        },
        {
          id: "critical-making",
          name: "Critical Making",
          courses: ["IAT 320", "IAT 336", "IAT 420"]
        },
        {
          id: "evidence-based",
          name: "Evidence-Based Interactive Systems",
          courses: ["IAT 334", "IAT 351", "IAT 432", "IAT 452"]
        }
      ]
  };