# Deploy Xpect Portal on Render

This guide walks you through hosting the **Xpect Portal** (React + Node.js + MongoDB) on [Render](https://render.com).

---

## Overview

| Part        | Where it runs        | Notes                          |
|------------|----------------------|--------------------------------|
| **Backend** | Render Web Service   | Node.js + Express API          |
| **Frontend**| Render Static Site   | Vite-built React (SPA)         |
| **Database**| MongoDB Atlas        | Free tier; set `MONGODB_URI`   |

You will create **two Render services** and use **one MongoDB Atlas cluster**.

---

## 1. Prerequisites

- [Render](https://render.com) account (free tier is enough).
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free M0 cluster).
- Your code in a **Git repository** (GitHub, GitLab, or Bitbucket). Render deploys from Git.

---

## 2. MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and sign in.
2. Create a **free M0 cluster** (e.g. in a region close to your Render region).
3. **Database Access** → Add Database User:
   - Username and password (save them).
   - Role: **Atlas Admin** (or **Read and write to any database**).
4. **Network Access** → Add IP Address:
   - Click **Add IP Address** → **Allow Access from Anywhere** (or add `0.0.0.0/0`).
   - This lets Render’s servers connect. You can restrict IPs later if needed.
5. Get your connection string:
   - **Database** → **Connect** → **Connect your application**.
   - Copy the URI. It looks like:
     ```text
     mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your user password and `<dbname>` with e.g. `xpect-portal`.

You’ll use this URI as `MONGODB_URI` for the backend on Render.

---

## 3. Backend on Render (Web Service)

1. In [Render Dashboard](https://dashboard.render.com), click **New +** → **Web Service**.
2. Connect your Git repo and select the **same repository** that contains `backend/` and `xpect-portal/`.
3. Configure the service:
   - **Name:** e.g. `xpect-portal-api`
   - **Region:** Choose one (e.g. Oregon).
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or paid if you prefer).

4. **Environment variables** (Add Environment Variable):

   | Key           | Value |
   |---------------|--------|
   | `MONGODB_URI` | Your Atlas URI, e.g. `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/xpect-portal?retryWrites=true&w=majority` |
   | `PORT`        | Leave empty (Render sets this automatically). |
   | `FRONTEND_URL`| Your frontend URL from the next step, e.g. `https://xpect-portal.onrender.com` (no trailing slash). |

   Add any other env vars your backend needs (e.g. email/JWT secrets).

5. Click **Create Web Service**. Render will build and deploy. Wait until it’s **Live**.
6. Copy the backend URL, e.g. `https://xpect-portal-api.onrender.com`. You’ll use it for the frontend and for `FRONTEND_URL` if you hadn’t set it yet.

---

## 4. Frontend on Render (Static Site)

1. In Render Dashboard, click **New +** → **Static Site**.
2. Connect the **same Git repository**.
3. Configure:
   - **Name:** e.g. `xpect-portal`
   - **Root Directory:** `xpect-portal`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. **Environment variables** (must be set so they’re available at **build** time for Vite):

   | Key             | Value |
   |-----------------|--------|
   | `VITE_API_URL`  | Your backend API base URL, e.g. `https://xpect-portal-api.onrender.com/api` |

   This is baked into the frontend at build time, so the app will call your Render backend.

5. Click **Create Static Site**. After the first build, Render will give you a URL like `https://xpect-portal.onrender.com`.

---

## 5. Point Frontend to Backend (and vice versa)

1. **Backend** (`xpect-portal-api`):
   - Set **FRONTEND_URL** to your **Static Site** URL, e.g. `https://xpect-portal.onrender.com` (no trailing slash).
   - Redeploy if you just added or changed it.

2. **Frontend** (already done if you set `VITE_API_URL`):
   - It should already use `https://xpect-portal-api.onrender.com/api` (or whatever you set). No code change needed.

3. **CORS**: Your backend uses `FRONTEND_URL` for `cors({ origin: process.env.FRONTEND_URL })`, so the browser will allow requests from your Render frontend.

---

## 6. Optional: Single Repo – Root Directory

If your repo root is the repo root (not inside a folder that contains `backend` and `xpect-portal`):

- Backend: **Root Directory** = `backend`.
- Frontend: **Root Directory** = `xpect-portal`.

If your repo **is** the `Onboarding` folder and `backend` and `xpect-portal` are inside it, use:

- Backend: **Root Directory** = `backend`.
- Frontend: **Root Directory** = `xpect-portal`.

Render will run all commands from the repo root, then look inside the Root Directory you set.

---

## 7. Free Tier Notes

- **Web Service (backend):** Spins down after ~15 minutes of no traffic. First request after that may take 30–60 seconds (cold start).
- **Static Site:** No spin-down; always fast.
- **MongoDB Atlas:** Free M0 has limits; enough for development and light production.

---

## 8. Quick Checklist

- [ ] MongoDB Atlas cluster created, user added, IP allowlist includes `0.0.0.0/0` (or Render IPs).
- [ ] Backend Web Service: Root = `backend`, start = `npm start`, env: `MONGODB_URI`, `FRONTEND_URL`.
- [ ] Frontend Static Site: Root = `xpect-portal`, build = `npm install && npm run build`, publish = `dist`, env: `VITE_API_URL` = `https://<your-backend>.onrender.com/api`.
- [ ] After first deploy of both: set Backend **FRONTEND_URL** to the Static Site URL and redeploy backend if needed.
- [ ] Test: open frontend URL → login/onboarding → check Network tab that API calls go to your Render backend URL.

---

## 9. Troubleshooting

| Issue | What to check |
|-------|----------------|
| Frontend loads but API calls fail | `VITE_API_URL` must be set on the **Static Site** and **redeploy** (rebuild). Check browser Network tab for the request URL. |
| CORS errors | Backend `FRONTEND_URL` must match the frontend origin exactly (protocol + domain, no trailing slash). Redeploy backend after changing. |
| 503 / Backend not responding | Free tier cold start; wait 30–60 s and retry. Or check Render logs for crashes (e.g. bad `MONGODB_URI`). |
| MongoDB connection failed | Check Atlas IP allowlist, username/password in URI, and that the database user has read/write permissions. |

---

## 10. Summary

1. **MongoDB Atlas:** Create cluster, user, allow IPs, copy URI.
2. **Render Web Service (backend):** Repo → Root `backend`, `npm start`, env `MONGODB_URI` and `FRONTEND_URL`.
3. **Render Static Site (frontend):** Repo → Root `xpect-portal`, build, publish `dist`, env `VITE_API_URL` = backend API URL.
4. Set **FRONTEND_URL** on the backend to your Static Site URL and redeploy.

After that, your Xpect Portal is hosted on Render with the frontend talking to the backend and the backend using MongoDB Atlas.
