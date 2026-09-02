# Online Code Judge — MERN Stack

A full-stack online code judge platform: browse problems, write code in an
in-browser editor (Monaco), submit it, and get instantly judged results
against test cases — plus AI-generated hints when you get stuck.

## Stack
- **Frontend:** React (Vite), React Router, Tailwind CSS, Monaco Editor, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth
- **Execution engine:** Node `child_process` sandbox — runs JavaScript, Python, C++, and Java submissions in isolated temp folders with a hard timeout per run

## Features
- JWT auth (register/login), roles: `user` / `admin`
- Full CRUD on problems (create/read/update/delete) — admin only for write ops
- Multi-language code execution & judging (JS, Python, C++, Java)
- Test case system with hidden + sample cases
- Submission history per user, per problem
- Leaderboard (rating + solved count)
- User profile pages
- Optional AI hints on failed submissions (Anthropic API — off by default)
- Rate limiting on the submission endpoint
- Clean, responsive dark-mode UI (Tailwind)

## Prerequisites
- Node.js 18+
- MongoDB running locally (or an Atlas URI) — you said you already have MongoDB on your PC, so just make sure `mongod` is running on `27017`
- For code execution to actually run submissions, the relevant language runtime must be installed and on your PATH:
  - JavaScript → `node` (already installed if you're reading this)
  - Python → `python3`
  - C++ → `g++`
  - Java → `javac` + `java` (JDK)
  You don't need all four — submissions in a language whose runtime isn't installed will simply fail with a clear error. Comment out languages you don't need in `frontend/src/pages/ProblemDetail.jsx` (`LANGUAGE_TEMPLATES`) if you want to hide them.

## Setup

```bash
# 1. Install all dependencies (root, backend, frontend)
npm run install:all

# 2. Configure the backend
cd backend
cp .env.example .env
# edit .env if needed — default MONGO_URI already points to mongodb://127.0.0.1:27017/code_judge

# 3. Seed sample problems + an admin account
npm run seed
# creates admin@codejudge.dev / Admin@123 and 3 sample problems

# 4. Run both servers (from the project root, two terminals)
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:5173
```

Open http://localhost:5173, log in as the seeded admin (or register a new
account), and go to **Problems** to try solving one, or **Admin** to add
your own.

## Enabling AI hints (optional)
Add to `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```
Without a key, the app still works fully — the hint box just shows a note
that AI hints are disabled.

## Project structure
```
online-code-judge/
├── backend/
│   ├── config/db.js            # Mongo connection
│   ├── models/                 # User, Problem, Submission
│   ├── controllers/            # auth, problem (CRUD), submission, user
│   ├── routes/                 # REST endpoints
│   ├── middleware/             # JWT auth, admin guard, error handler
│   ├── utils/codeRunner.js     # sandboxed execution engine
│   ├── utils/aiHint.js         # optional AI hint generator
│   ├── utils/seed.js           # sample data seeder
│   └── server.js
└── frontend/
    └── src/
        ├── pages/               # Home, Login, Register, Problems, ProblemDetail,
        │                        # Submissions, Leaderboard, Profile, Admin
        ├── components/          # Navbar, badges, ProtectedRoute
        ├── context/AuthContext.jsx
        └── api/axios.js
```

## Deploying
- **Backend:** deploy to Render/Railway/EC2 — note it needs the language
  runtimes (`python3`, `g++`, `javac`) installed on the host for execution
  to work in all languages, and a MongoDB URI (Atlas works fine).
- **Frontend:** `npm run build --prefix frontend` → deploy `frontend/dist`
  to Vercel/Netlify, and point `axios.js` baseURL or the Vite proxy at your
  deployed backend URL.

## Scaling the execution engine further
The current runner isolates each submission in its own temp directory with a
timeout. If you want to scale this to a production-grade multi-tenant judge:
- Run each execution inside a locked-down Docker container
  (`--rm --network none --memory=128m --cpus=0.5`) instead of a bare
  `child_process` — swap this in inside `backend/utils/codeRunner.js`.
- Put submissions on a queue (e.g. BullMQ + Redis) so the API responds
  immediately and a worker pool judges submissions asynchronously, with the
  frontend polling `GET /api/submissions/:id` for the result.

Both are natural next steps and the code is structured so `codeRunner.js`
is the only file you'd need to swap out to add them.
