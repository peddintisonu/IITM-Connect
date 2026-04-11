# IITMConnect 🎓

A unified campus platform for IIT Madras — replacing WhatsApp groups, mass mails, Google Forms, and scattered Instagram pages.

> LinkedIn (profiles + PORs) + Instagram (clubs posting) + Intranet (college ops)

---

## 🛠 Tech Stack

- **Frontend:** React + Vite (PWA)
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB Atlas
- **Auth:** Passport.js + Google OAuth (smail only)
- **File Storage:** Cloudinary
- **Real Time:** Socket.io
- **Email:** Resend
- **Push Notifications:** Firebase FCM

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/peddintisonu/IITM-Connect.git
cd IITM-Connect
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Mac/Linux
cp server/.env.example server/.env

# Windows
copy server\.env.example server\.env
```

Fill in the values in `server/.env` before starting.

### 4. Run in development

```bash
npm run dev          # starts both client and server
npm run dev:server   # server only
npm run dev:client   # client only
```

---

## 📜 Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts client + server concurrently |
| `npm run dev:server` | Starts server only |
| `npm run dev:client` | Starts client only |
| `npm run build` | Builds all workspaces for production |
| `npm run lint` | Checks code for errors |
| `npm run lint:fix` | Auto-fixes linting issues |
| `npm run format` | Formats code with Prettier |
| `npm run clean` | Removes node_modules and build artifacts |
| `npm run reinstall` | Full reset and reinstall |

---

## 📦 Adding Packages

Always specify the workspace:

```bash
npm install <package> -w server
npm install <package> -w client
```

## 🤝 Contributing

This is a closed project for IIT Madras students. If you're a contributor with access:

### Setup

1. Fork the repo on GitHub
2. Clone your fork locally
```bash
git clone https://github.com/YOUR_USERNAME/IITM-Connect.git
cd IITM-Connect
```
3. Add the original repo as upstream
```bash
git remote add upstream https://github.com/peddintisonu/IITM-Connect.git
```
4. Follow the Quick Start steps above to get the project running locally.

### Workflow

1. Always pull latest from upstream before starting work
```bash
git pull upstream main
```
2. Never push directly to `main`
3. Create a branch for your feature
```bash
git checkout -b feature/your-feature-name
```
4. Make your changes and commit clearly
```bash
git commit -m "feat: add org creation endpoint"
```
5. Push to your fork
```bash
git push origin feature/your-feature-name
```
6. Open a Pull Request on GitHub from your fork against `main`
7. Wait for review before merging

### Commit Message Convention

| Prefix | Use for |
| :--- | :--- |
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Config, cleanup |
| `docs:` | Documentation |
| `refactor:` | Code restructure, no feature change |

---

## 👤 Author

Built by Siva Peddinti

- **GitHub:** [@peddintisonu](https://github.com/peddintisonu)
- **LinkedIn:** [Siva Peddinti](https://www.linkedin.com/in/siva-vardhan-peddinti/)