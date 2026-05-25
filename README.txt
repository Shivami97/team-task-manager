========================================================================
📌 AETHER — Premium Team Task Manager (Full-Stack)
========================================================================

Aether is a premium, highly polished team collaboration platform where users can organize projects, assign high-impact tasks, manage schedules with interactive Kanban boards, and track real-time team timelines in a beautiful glassmorphism workspace.

Designed with Vanilla CSS Modules, Aether sports a vibrant deep dark theme, glows, responsive typography, and fluid micro-transitions that deliver a world-class user experience.

------------------------------------------------------------------------
🚀 KEY FEATURES
------------------------------------------------------------------------

- Double-Sided Authentication: Full Login and Registration forms with robust Zod validation.
- Granular Role-Based Access Control (RBAC):
  * Admin: Create projects, add/remove team members, assign tasks, delete tasks, and delete projects.
  * Member: Access authorized projects, track project timelines, and update task progress (To Do, In Progress, In Review, Completed).
- Responsive Kanban Workspace: Interactive column boards sorting task cards with immediate quick-change dropdown status synchronizers.
- Velocity SVG Progress Indicators: Pure SVG radial completion percentages displaying team velocity in real time.
- Unified Global Toast Notifications: Glowing, interactive sidebar notifications giving real-time feedback on user actions.
- Zero-Friction Parity Engine: Automagical database switching script toggling between SQLite locally and PostgreSQL on Railway depending on the environment variables!

------------------------------------------------------------------------
🛠️ TECH STACK & ARCHITECTURE
------------------------------------------------------------------------

- Frontend & Backend: Next.js 16 (App Router) + TypeScript + React 19.
- Styling: Premium custom-crafted Vanilla CSS Modules with rich glassmorphism.
- Database ORM: Prisma ORM (v6).
- Session Layer: Secure JWT-based stateless cookies validated via Next.js Middleware route guards.
- Input Validation: Zod structural schema checking on both client and server boundaries.

------------------------------------------------------------------------
💻 LOCAL QUICK START
------------------------------------------------------------------------

Aether is engineered for zero-friction local execution. You do not need to install local PostgreSQL or Docker! It runs on SQLite locally and migrates automatically.

1. Clone the project and install dependencies:
   Go to the project folder:
   cd team-task-manager

   Install all packages:
   npm install

2. Configure Environment Variables:
   A standard .env is already configured for you:
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="e972986427dbbe51859c2bb0e4a7372cf931b67f13919c011e4bf648c69cb5a8"

3. Bootstrap & Seed the Database:
   We provide a 1-click seed script to populate the local database with pre-configured mock teams, timelines, and tasks:
   npm run seed

4. Run the Development Server:
   npm run dev
   Open your browser and navigate to http://localhost:3000

------------------------------------------------------------------------
🔐 PRE-SEEDED DEMO CREDENTIALS
------------------------------------------------------------------------

Log in with any of these accounts after running the seed command to test the role boundaries immediately:

* Admin User:  admin@aether.com  / password123
  Full workspace authority (Create tasks, recruit members, delete projects).
  
* Team Member 1:  member1@aether.com / password123
  Standard team member (Can view boards, modify task status of assigned items).
  
* Team Member 2:  member2@aether.com / password123
  Standard team member (Can view boards, modify task status of assigned items).

------------------------------------------------------------------------
🌐 RAILWAY DEPLOYMENT GUIDE (MANDATORY)
------------------------------------------------------------------------

Follow these simple steps to deploy Aether live on Railway with a managed PostgreSQL database:

1. Create a GitHub Repository:
   - Initialize Git in the project root:
     git init
     git add .
     git commit -m "feat: Aether initial launch"
   - Create a new repository on GitHub and link it:
     git remote add origin <your-github-repo-url>
     git branch -M main
     git push -u origin main

2. Provision PostgreSQL on Railway:
   - Log into your Railway Dashboard (https://railway.app/).
   - Click "New Project" -> "Provision PostgreSQL".
   - Railway will provision a high-performance database service instantly.

3. Deploy the Next.js Service:
   - Click "New" -> "GitHub Repo" and select your pushed team-task-manager repository.
   - In the Service Settings under Variables, add the following:
     * DATABASE_URL: Set it to ${{ Postgres.DATABASE_URL }} (Railway automatically binds this).
     * JWT_SECRET: Generate a secure random string.
   - Click "Deploy".

Why this is foolproof: Aether's custom build command in package.json contains "node scripts/db-prep.js && prisma generate && prisma db push && next build".
When Railway builds the app:
- It detects the postgresql connection string in DATABASE_URL.
- The database prep script rewrites the Prisma engine provider to postgresql.
- prisma db push syncs your schema structure directly with the live database instantly.
- The Next.js compiler runs, giving you a live, fully functional URL.

------------------------------------------------------------------------
📡 REST API SPECIFICATIONS
------------------------------------------------------------------------

- POST  /api/auth/signup      Registers new accounts and issues JWT cookies. (Public)
- POST  /api/auth/login       Authenticates credentials and logs users in. (Public)
- POST  /api/auth/logout      Clears current user authentication session. (Public)
- GET   /api/auth/me          Fetches active user profile details. (Logged In)
- GET   /api/dashboard        Aggregates tasks stats, upcoming items, recent projects. (Logged In)
- GET   /api/projects         Lists all projects where the user is an owner or member. (Logged In)
- POST  /api/projects         Creates new projects, adding creator as ADMIN. (Logged In)
- GET   /api/projects/[id]    Fetches detailed project, members list, and kanban cards. (Project Member)
- DELETE /api/projects/[id]   Permanently deletes project, tasks, and memberships. (Project Admin)
- POST  /api/projects/[id]/members  Recruits a registered user by email to the project. (Project Admin)
- POST  /api/projects/[id]/tasks    Creates a new task inside the project. (Project Admin)
- PATCH /api/tasks/[taskId]   Edits task. Members can ONLY update status. (Project Member)
- DELETE /api/tasks/[taskId]  Deletes specific task item. (Project Admin)

------------------------------------------------------------------------
📹 DEMO VIDEO OUTLINE (2-5 MIN)
------------------------------------------------------------------------

To score top marks for your submission, use this layout for your demo video walkthrough:

1. Introduction (30s): Start at the Landing Page, introduce Aether's interface theme, and log in using admin@aether.com (Admin).
2. Dashboard Overview (30s): Highlight the glowing statistics grid, the radial progress ring, recent projects, and imminent urgent tasks.
3. Kanban Workspace (1 min):
   - Navigate to the "Alpha Platform Launch" project board.
   - Show columns and cards.
   - Modify a task status using the quick selector; note the global success notification toast!
   - Open a card, change priority, and update.
4. Admin Capabilities (1 min):
   - Create a new task "Finalize Video Review" and assign it to "Sarah Connor".
   - Open the "Add Team" modal and add a member (by typing member2@aether.com or creating a new user).
5. Role Boundary Demo (30s):
   - Log out and log back in as member1@aether.com (Sarah Connor).
   - Show that Sarah Connor can view the board and update task statuses, but the "Add Team", "Create Task", and "Delete Project" buttons are hidden.
   - Prove that trying to access admin endpoints returns an unauthorized error.
6. Closing (30s): Show off the perfect responsive scaling, summarize the code structure, and conclude.
