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