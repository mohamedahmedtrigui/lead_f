# MiralDrive Lead Qualification — Front-end (`lead_f`)

React SPA used by MiralDrive dispatchers and administrators to call, qualify and
follow up leads. It consumes the Laravel API of the
[`lead_b`](https://github.com/mohamedahmedtrigui/lead_b) repository.

**Stack:** React 19 (JSX) · Vite · React Router · TanStack Query · Axios ·
Tailwind CSS 4 (blue / white theme) · lucide-react · sonner

---

## Quick start

```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:8000
npm run dev              # http://localhost:5173
```

The API must be running on `http://localhost:8000` (see `lead_b`). Open the app
on **`localhost`**, not `127.0.0.1`: authentication relies on a session cookie
shared by host.

| Script | Purpose |
|---|---|
| `npm run dev` | dev server with HMR |
| `npm run build` | production build in `dist/` |
| `npm run preview` | serve the production build locally |
| `npm run lint` | oxlint |

---

## Architecture (feature-based)

```
src/
├── app/                 App providers + router (lazy-loaded pages, role guards)
├── components/
│   ├── ui/              design-system primitives (Button, Card, Field, Modal, Badge, Stars…)
│   ├── layout/          AppLayout (responsive sidebar), Logo, navigation per role
│   └── badges.jsx       status / interest / outcome badges
├── config/env.js        typed access to VITE_* variables
├── constants/domain.js  labels & colors of backend enums
├── hooks/               generic hooks (debounce…)
├── lib/                 http (Axios + Sanctum CSRF), queryClient, format, download
└── features/
    ├── auth/            login, register, AuthContext, route guards
    ├── dashboard/       dispatcher & admin dashboards (KPIs, funnel, performance)
    ├── leads/           lead tables, filters, assignment & distribution, import, admin detail
    ├── calls/           3-column call workspace (customer · script · live summary)
    ├── qualification/   wizard: step config, state hook, steps, score gauge, summary
    ├── script/          call-script API + admin script editor
    ├── dispatchers/     approval & account management
    └── activity/        call history & audit log
```

Each feature owns its `api/`, `hooks/`, `components/` and `pages/`; features only
share code through `components/`, `lib/` and explicit imports, so a new CRM
module is a new folder.

### Qualification wizard

- `features/qualification/config/steps.js` defines the 14 levels, conditional
  steps (B2B only for employees/company) and per-step validation that mirrors
  the server rules.
- `useQualificationWizard` keeps answers locally (nothing is lost with
  **Retour / Suivant**), autosaves a draft on every step change and after 1.2 s
  idle, and receives the **server-computed** interest score.
- All wording (speech, questions, answer labels, tips) comes from `GET /script`,
  editable by admins in **Script d’appel**.
- Keyboard: `1`–`9` choose an answer · `Entrée` next · `Alt+←` back ·
  `Ctrl+Entrée` next from a text field.

---

## Deployment

```bash
VITE_API_URL=https://api.miraldrive.com npm run build
```

Serve `dist/` as a static SPA with a fallback to `index.html`, e.g. Nginx:

```nginx
location / {
    try_files $uri /index.html;
}
```

The SPA domain must be listed in the API's `SANCTUM_STATEFUL_DOMAINS` and
`CORS_ALLOWED_ORIGINS`, and both apps must share the parent cookie domain
(`SESSION_DOMAIN=.miraldrive.com`).
