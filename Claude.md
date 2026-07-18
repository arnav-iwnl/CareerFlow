# AI Prompt to Reproduce CareerFlow

**Context:**
You are an expert full-stack developer. Your task is to reproduce "CareerFlow", an AI-powered career development platform. 
Follow the requirements, architecture patterns, folder structure, database schema, and detailed API implementations described below to generate the complete codebase from scratch.

---

## 1. Project Overview & Tech Stack
**CareerFlow** is a full-stack AI-powered career coaching platform that provides personalized industry insights, an AI resume builder with ATS scoring, AI-generated cover letters, mock interview quizzes, and ML-based course recommendations.

- **Framework:** Next.js 15 (App Router)
- **Language:** JavaScript / React 19
- **Styling:** Tailwind CSS 4, Shadcn UI, Radix UI
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma 6.4
- **Auth:** Clerk (@clerk/nextjs)
- **AI Integration:** Google Generative AI (Gemini 2.5 Flash Lite)
- **Background Jobs:** Inngest (Cron jobs)
- **State/Data Fetching:** SWR, Custom `useFetch` hook
- **Forms & Validation:** React Hook Form, Zod
- **Other:** Recharts (charts), @uiw/react-md-editor (Markdown), html2pdf.js / react-to-print (PDF Export)

---

## 2. Directory Structure

Recreate the following project structure:

```
├── .env
├── .env.local
├── eslint.config.mjs
├── jsconfig.json
├── middleware.js
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── components.json
├── actions/
│   ├── ats.js             # Server actions for ATS scoring
│   ├── cover-letter.js    # CRUD and AI generation for cover letters
│   ├── dashboard.js       # Industry insights AI generation
│   ├── interview.js       # AI Quiz generation and assessment saving
│   ├── keywords.js        # AI Keyword suggestion for resumes
│   ├── resume.js          # Resume CRUD and AI enhancement
│   └── user.js            # User profile updates & onboarding status
├── app/
│   ├── (auth)/            # Clerk Sign-in/Sign-up routes
│   ├── (main)/
│   │   ├── dashboard/     # Industry insights UI
│   │   ├── resume/        # Markdown resume builder UI
│   │   ├── interview/     # Quiz and stats UI
│   │   ├── ai-cover-letter/ # Cover letter UI
│   │   ├── courses/       # Course recommendations UI
│   │   └── onboarding/    # First-time user profile setup
│   ├── api/
│   │   └── inngest/route.js # Inngest API endpoint
│   ├── lib/
│   │   ├── helper.js      # Utility functions (e.g., markdown formatting)
│   │   └── schema.js      # Zod validation schemas
│   ├── globals.css
│   ├── layout.js
│   └── page.js            # Landing Page
├── components/
│   └── ui/                # Shadcn UI components
├── data/
│   └── industries.js      # Static industry data for onboarding dropdowns
├── hooks/
│   └── use-fetch.js       # Custom React hook for data fetching
├── lib/
│   ├── checkUser.js       # Syncs Clerk auth with DB
│   ├── prisma.js          # Prisma client instance
│   └── inngest/
│       ├── client.js      # Inngest client initialization
│       └── functions.js   # Weekly cron job logic
└── prisma/
    └── schema.prisma      # DB Schema
```

---

## 3. Database Schema (Prisma)

Use the following Prisma schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String           @id @default(uuid())
  clerkUserId     String           @unique
  email           String           @unique
  name            String?
  imageUrl        String?
  industry        String?
  industryInsight IndustryInsight? @relation(fields: [industry], references: [industry])
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  bio             String?
  experience      Int?
  skills          String[]
  assessments     Assessment[]
  resume          Resume?
  coverLetter     CoverLetter[]
}

model Assessment {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  quizScore      Float
  questions      Json[]
  category       String
  improvementTip String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([userId])
}

model Resume {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  content   String   @db.Text
  atsScore  Float?
  feedback  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CoverLetter {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  content        String
  jobDescription String?
  companyName    String
  jobTitle       String
  status         String   @default("completed")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([userId])
}

model IndustryInsight {
  id                String   @id @default(cuid())
  industry          String   @unique
  users             User[]
  salaryRanges      Json[]
  growthRate        Float
  demandLevel       DemandLevel
  topSkills         String[]
  marketOutlook     MarketOutlook
  keyTrends         String[]
  recommendedSkills String[]
  lastUpdated       DateTime @default(now())
  nextUpdate        DateTime

  @@index([industry])
}

enum DemandLevel {
  HIGH
  MEDIUM
  LOW
}

enum MarketOutlook {
  POSITIVE
  NEUTRAL
  NEGATIVE
}
```

---

## 4. Architecture & Implementation Patterns

### 4.1 Authentication (Clerk)
- Use `clerkMiddleware` to protect `/dashboard`, `/resume`, `/interview`, `/ai-cover-letter`, `/onboarding`, `/courses`.
- Global Header calls a utility function `checkUser()` on first load. This function checks if `auth().userId` exists in the DB. If not, it creates a new `User` mapping Clerk's `userId` to `clerkUserId`.

### 4.2 Server Actions (`"use server"`)
- Replace standard REST API routes with Next.js Server Actions inside the `actions/` folder.
- **Crucial Pattern:** Every server action must start with:
  ```javascript
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  ```

### 4.3 `useFetch` Hook (Client-side)
Implement a custom React hook `useFetch(serverAction)` that tracks `data`, `loading`, and `error` states for any server action. Use `sonner` toast to display errors.

### 4.4 Inngest Cron Job
Create an Inngest cron job running weekly (`0 0 * * 0`). It must query all `IndustryInsight` records, iterate over them, generate fresh insights using Gemini AI, and update the database to ensure dashboard data remains fresh.

---

## 5. Specific API Calls / Server Actions (With Example Inputs & Outputs)

### 5.1 Onboarding & Industry AI Generation
**File:** `actions/user.js` and `actions/dashboard.js`
- **Action:** `UpdateUser(data)`
- **Behavior:** Updates user profile (experience, skills, bio, industry). If the industry doesn't have an `IndustryInsight` in DB, it generates one using Gemini and saves both user + insight inside a Prisma `$transaction` (with 10s timeout).

**AI Prompt for Industry Insights (`generateAIInsights`):**
```text
Analyze the current state of the {industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "HIGH" | "MEDIUM" | "LOW",
  "topSkills": ["skill1", "skill2"],
  "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "keyTrends": ["trend1", "trend2"],
  "recommendedSkills": ["skill1", "skill2"]
}
IMPORTANT: Return ONLY the JSON. Include at least 5 roles, 5 skills, 5 trends.
```
**Example Output (Parsed JSON):**
```json
{
  "salaryRanges": [
    { "role": "Frontend Developer", "min": 60000, "max": 150000, "median": 100000, "location": "Remote" }
  ],
  "growthRate": 12.5,
  "demandLevel": "HIGH",
  "topSkills": ["React", "Next.js", "TypeScript"],
  "marketOutlook": "POSITIVE",
  "keyTrends": ["AI integration", "Server Components"],
  "recommendedSkills": ["GraphQL", "Tailwind CSS"]
}
```

### 5.2 AI Mock Interview (Quiz Generation)
**File:** `actions/interview.js`
- **Action:** `generateQuiz()`
- **Prompt Sent to Gemini:** Generate 10 multiple-choice technical interview questions for a `{industry}` professional with expertise in `{skills}`. Return JSON array format: `[{ "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..." }]`.
- **Example Output (JSON):**
```json
[
  {
    "question": "What is the primary benefit of React Server Components?",
    "options": ["Better SEO", "Zero client-side JS bundle size", "Easier state management", "Faster animations"],
    "correctAnswer": "Zero client-side JS bundle size",
    "explanation": "Server components render entirely on the server and send only HTML to the client."
  }
]
```
- **Action:** `saveQuizResult(score, wrongAnswers)`
- **Behavior:** If there are wrong answers, ask Gemini for a concise improvement tip. Save the result to `Assessment`.

### 5.3 Resume Builder & ATS Scoring
**File:** `actions/resume.js` and `actions/ats.js`
- **Action:** `improveWithAI(text, section)`
- **Behavior:** Rewrites a specific section (e.g., experience description) to be highly impactful using action verbs.
- **Action:** `calculateATSScore(resumeContent, jobDescription)`
- **Behavior:** 
  1. Does programmatic checks (missing headings, emojis).
  2. Prompts Gemini to score the keyword match between the resume and job description.
  3. Averages the score and returns feedback.

### 5.4 AI Cover Letter Generator
**File:** `actions/cover-letter.js`
- **Action:** `generateCoverLetter(companyName, jobTitle, jobDescription)`
- **Behavior:** Prompts Gemini with the user's stored bio, experience, skills, industry, and the target job description.
- **Expected Output format:** A highly tailored, professional Markdown string (~400 words) ready to be previewed/edited in the UI.

### 5.5 Course Recommendations (Microservice pattern)
**File:** Client-side fetch in `app/(main)/courses/page.js`
- **Behavior:** Calls an external REST API (e.g., a Flask scikit-learn server) like `GET https://mlm-vrqj.onrender.com/api/get-courses?userId={clerkId}`.
- **Expected Output:**
```json
[
  {
    "title": "Advanced React Patterns",
    "url": "https://coursera.org/...",
    "relevanceScore": 0.95
  }
]
```

---

## 6. Development Workflow
1. Initialize Next.js app router. Install `tailwindcss`, `lucide-react`, `recharts`, `zod`, `react-hook-form`.
2. Setup Clerk Auth. Implement `middleware.js`.
3. Initialize Prisma. Add Neon DB URL to `.env`. Run `prisma db push`.
4. Implement root layout and `checkUser` logic.
5. Build onboarding form + `$transaction` logic.
6. Build Dashboard UI (using Recharts).
7. Implement Resume Editor (`@uiw/react-md-editor`).
8. Implement Mock Interview system.
9. Implement Cover Letters.
10. Connect Inngest for weekly cron jobs.

Follow this prompt meticulously to rebuild the core architecture, AI integrations, and UI of CareerFlow.
