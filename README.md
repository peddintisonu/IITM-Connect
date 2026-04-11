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

---

## 👤 Author

Built by Siva Peddinti

- **GitHub:** [@peddintisonu](https://github.com/peddintisonu)
- **LinkedIn:** [Siva Peddinti](https://www.linkedin.com/in/siva-vardhan-peddinti/)