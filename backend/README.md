# Backend
Current documentation for backend.

# MongoDB Setup (as of March 5, 2026)

1. Accept invitation to MongoDB organization
2. Within the organization, navigate to Projects then to PlanlyApp
3. On the left hand side, navigate to Database & Network Access
4. Now, navigate to either Edit (your current user) OR Add a New User 
5. Go back to Planly app on VSCode
6. Create a `.env` file INSIDE the server folder (important!!)
7. Paste the following inside `.env` and replace the `<>` tags with respective elements:<br/>
`MONGO_WQB_URI=mongodb+srv://<user_name>:<password>@cluster0.xsec5jy.mongodb.net/wqb?appName=Cluster0`

## Troubleshooting
If you're running into any errors, check the following:
- Ensure your IP address is added to the IP Access List
- Ensure the MONGO_WQB_URI doesn't have `<>` tags around your username and password

# Available API Services (as of March 9)
## Native Server API
### `POST /api/parse`<br/>
Query Parameters<br/>
- `pdf` Uint8Array<br/>

**Responses**<br/>
- 201 Parsed Transcript in JSON<br/>
- 400 No file uploaded<br/>
- 500 Internal Server error<br/>

__________________________________

### `POST /api/check-requirements`<br/>
**Query Parameters**<br/>
- `transcriptData` JSON<br/>
- `degreeType` string<br/>

**Responses**<br/>
- 201 Student Transcript Summary JSON<br/>
- 400 No body attached<br/>
- 500 Internal Server error<br/>

__________________________________

## Auth Routes<br/>
### `POST /api/auth/register`<br/>
**Query Parameters**<br/>
- `name` string<br/>
- `studentID` string<br/>
- `email` string<br/>
- `password` string<br/>

**Responses**<br/>
- 201 Student Account Created<br/>
- 400 User already exists<br/>
- 500 Internal Server error<br/>

__________________________________

### `POST /api/auth/login`<br/>
**Query Parameters**<br/>
- `email` string<br/>
- `password` string<br/>

**Responses**<br/>
- 201 JSON Web Token<br/>
- 400 User not found<br/>
- 401 Invalid Credentials<br/>
- 500 Internal Server error<br/>

__________________________________

## SFU Courses Routes
### `POST /api/sfuCourses/courses`<br/>
**Query Parameters**<br/>
- `year` string
- `term` string
- `department` string

**Responses**<br/>
- 201 Courses in department JSON - {courses: data}<br/>
- 400 No body attached<br/>
- 500 Internal Server error<br/>

__________________________________

### `POST /api/sfuCourses/course-sections`<br/>
**Query Parameters**<br/>
- `year` string
- `term` string
- `department` string
- `courseNumber` string

**Responses**<br/>
- 201 All available course sections for course<br/>
- 400 No body attached<br/>
- 500 Internal Server error<br/>

__________________________________

### `POST /api/sfuCourses/course-outline`<br/>
**Query Parameters**<br/>
- `year` string
- `term` string
- `department` string
- `courseNumber` string
- `courseSection` string

**Responses**<br/>
- 201 Detailed Course Outline<br/>
- 400 No body attached<br/>
- 500 Internal Server error<br/>

__________________________________

## Transcript Routes<br/>
### `POST /api/transcript/`<br/>
**Query Parameters**<br/>
- `token` JSON
- `userId` string

**Responses**<br/>
- 200 Transcript Found<br/>
- 400 No body attached<br/>
- 404 No transcript found <br/>
- 500 Internal Server error<br/>

__________________________________

### `POST /api/transcript/upload`<br/>
**Query Parameters**<br/>
- `data` JSON
- `userId` string

**Responses**<br/>
- 201 Transcript saved & created<br/>
- 400 No body attached<br/>
- 500 Internal Server error<br/>

__________________________________

### `DELETE /api/transcript/`<br/>
**Query Parameters**<br/>
- `data` JSON
- `userId` string

**Responses**<br/>
- 200 Transcript deleted<br/>
- 404 No transcript found<br/>
- 500 Internal Server error<br/>