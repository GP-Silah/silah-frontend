# Silah Frontend

_Last Updated: September 2025_

This is the frontend application for [Silah](https://github.com/GP-Silah), an AI-augmented full-stack B2B platform that connects suppliers and buyers. Built using [React](https://reactjs.org/) and [Vite](https://vitejs.dev/), it features fast hot-module reloading (HMR), code splitting, and automatic route detection.

> **Silah** (Arabic: صِلَة) _\[noun]_ Connection, bond, link; often used to describe the ties between people, family, or communities.

---

## Architecture Overview

The frontend handles:

- **User Interfaces** (Landing, Login, Signup, Buyer/Supplier dashboards)
- **Routing** (Dynamic route discovery and lazy-loading pages)
- **Multi-language Support** (i18n with Arabic and English)
- **Forms & Validation** (Signup, Login, Password Reset, Buyer/Supplier forms)
- **File Uploads** (Images & documents integration with backend)
- **Payment Integration UI** (Tap Payments frontend flows)
- **Responsive Layouts** (RTL/LTR support)

---

## Tech Stack

- **Framework:** React 18 + Vite
- **Routing:** react-router-dom v6
- **State Management:** React Context + Hooks
- **Styling:** CSS Modules / SCSS
- **Translation:** react-i18next
- **Form Validation:** Yup + React Hook Form
- **Testing:** Vitest + React Testing Library
- **Bundling:** Vite (HMR, optimized build)
- **Version Control:** Git + GitHub

---

## Prerequisites

Make sure you have:

- Node.js >= 20
- npm >= 10
- Git >= 2.40

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/GP-Silah/silah-frontend.git
cd silah-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy example env file:

```bash
cp .env.example .env
```

Edit `.env` for your configuration.

### 4. Start the Development Server

```bash
npm run dev
```

This starts Vite dev server with HMR. The default URL: `http://localhost:5173`

---

## Project Structure

```
src/
├─ components/       # Reusable UI components
├─ pages/            # Each page folder contains a page component
│  ├─ Landing/
│  │  └─ Landing.jsx
│  ├─ Signup/
│  ├─ Login/
│  └─ BuyerHomePage/
├─ App.jsx           # Auto-imports all pages dynamically
├─ main.jsx          # ReactDOM entry point
└─ i18n.js           # Language setup
```

> **Note:** Pages are auto-detected for routing. You can optionally export a `routePath` in your page file to override the default path.

---

## Dynamic Routing Example

Each page can export a custom path:

```jsx
// src/pages/BuyerHomePage/BuyerHomePage.jsx
import React from 'react';

export const routePath = '/buyer-home';

function BuyerHomePage() {
  return <h1>Welcome to Buyer Dashboard</h1>;
}

export default BuyerHomePage;
```

The App will automatically pick up this path without modifying `App.jsx`.

---

## Page Titles

Each page can set its own browser title dynamically, based on the current language, using the `useTranslation` hook from i18next.

```jsx
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function Landing() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('pageTitle.landing', { ns: 'common' });
  }, [t, i18n.language]);

  return <div>Landing Page</div>;
}

export default Landing;
```

This ensures the page title updates automatically whenever the user changes the language.

---

## Multi-Language Support

- **Arabic (RTL)**
- **English (LTR)**

Language is handled globally via `i18next`. CSS classes `lang-ar` and `lang-en` adjust layout direction automatically.

```jsx
<div className={i18n.language === 'ar' ? 'lang-ar' : 'lang-en'}>
  <Header />
  <Routes>{routeElements}</Routes>
  <Footer />
</div>
```

---

## Development Workflow

### Daily Commands

```bash
npm run dev       # Start frontend dev server with HMR
npm run build     # Build production-ready bundle
npm run lint      # Run ESLint
npm run format    # Prettier formatting
npm run test      # Run unit & integration tests
```

---

## Code Quality

- ESLint + Prettier for consistent code style
- All new pages/components must pass linting before PR

---

## API Integration

Frontend communicates with Silah backend using REST API endpoints:

- Base URL from `.env` (`VITE_API_URL`)
- Authorization via JWT tokens stored in cookies at `localStorage`
- File uploads handled via Cloudflare R2 signed URLs

---

## Troubleshooting

### Common Issues

- **Page not showing:** Make sure folder and file names are correct and App.jsx routes are auto-detecting.
- **HMR not working:** Restart Vite server.
- **CSS not applied:** Ensure import paths are correct (`import '../../App.css';`).

---

## Getting Help

- Check console and network logs
- Verify environment variables are set correctly
- Contact frontend team or check GitHub Issues

---

## License

This project is licensed under the terms specified in the LICENSE file.

---

> Built with care by Silah's Frontend Team, as part of the Graduation Project.
