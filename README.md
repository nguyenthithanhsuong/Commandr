# Commandr

A full-stack HR and project management platform for managing personnel, attendance, departments, projects, tasks, requests, and reporting.

**Frontend** built with Next.js (App Router) and JavaScript
**Backend** powered by a direct MySQL connection via custom DB layer
**Testing** via Playwright (end-to-end)

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js, React, JavaScript |
| **Styling** | CSS Modules |
| **API** | Next.js App Router, REST |
| **Authentication** | Custom (session-based, cookie check) |
| **Database** | MySQL via custom DB layer |
| **Testing** | Playwright (end-to-end) |

---

## Project Structure

```
Commandr/
├── src/app/
│   ├── api/                  # REST API routes
│   │   ├── auth/             # Auth check and signout
│   │   └── personnel/        # Personnel API
│   ├── attendance/           # Attendance module
│   ├── department/           # Department module
│   ├── personnel/            # Personnel (add, update, view)
│   ├── project/              # Project (add, update, view)
│   ├── task/                 # Task (add, update, view)
│   ├── request/              # Request module
│   ├── report/               # Report module
│   ├── signin/               # Authentication
│   ├── components/           # Shared UI components
│   └── db/                   # Database connection and operations
├── tests/                    # Playwright e2e tests
├── public/                   # Static assets
└── README.md
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev   # Port 3000

# Build for production
npm run build
npm run start
```

---

## Environment Variables

Create `.env` in the project root:

```bash
# Required — database connection
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

---

## Build Output

Routes inferred from the app structure:

| Module | Routes |
|---|---|
| Auth | `/signin`, `/api/auth/check`, `/api/auth/signout` |
| Personnel | `/personnel`, `/personnel/addpersonnel`, `/personnel/updatepersonnel`, `/personnel/viewpersonnel`, `/api/personnel` |
| Attendance | `/attendance` |
| Department | `/department` |
| Project | `/project`, `/project/addproject`, `/project/updateproject`, `/project/viewproject` |
| Task | `/task`, `/task/addtask`, `/task/updatetask`, `/task/viewtask` |
| Request | `/request`, `/request/addrequest` |
| Report | `/report` |

---

## Security

- Authentication: Custom session check via `/api/auth/check` on protected routes
- Signout: Server-side session invalidation via `/api/auth/signout`
- Database: Operations isolated in a dedicated DB layer (`db.js`, `dbOperations.js`)

---

## Testing

Playwright end-to-end tests cover all major modules.

```bash
# Run all tests
npx playwright test

# Run a specific module
npx playwright test tests/signin.spec.js
npx playwright test tests/personnel.spec.js

# View last test report
npx playwright show-report
```

Tested modules: signin, personnel, attendance, department, project, task, request, report.

---

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and validate: `npm run build`
3. Run tests: `npx playwright test`
4. Push branch: `git push origin feature/my-feature`
5. Create a Pull Request
