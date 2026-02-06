# 🚀 Railway Deployment Guide

## 📋 Prerequisites
- GitHub account with your code pushed
- Railway account (sign up at https://railway.app)

---

## 🔧 BACKEND DEPLOYMENT

### Step 1: Create Backend Service
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `tracker` repository
5. Railway will detect it's a Node.js project

### Step 2: Configure Backend - IMPORTANT!
1. Click on your service
2. Go to "Settings" tab
3. **CRITICAL**: Set **Root Directory** to: `backend`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm start`
6. Click "Save Changes"

### Step 3: Add Environment Variables
Go to "Variables" tab and add:

```
PORT=3001
NODE_ENV=production
JWT_SECRET=<generate-a-strong-random-256-bit-secret>
CORS_ORIGIN=https://your-frontend-url.railway.app
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Copy your backend URL (e.g., `https://tracker-backend-production.up.railway.app`)

---

## 🎨 FRONTEND DEPLOYMENT

### Step 1: Create Frontend Service
1. In the same Railway project, click "New Service"
2. Select "Deploy from GitHub repo"
3. Choose your `tracker` repository again

### Step 2: Configure Frontend - IMPORTANT!
1. Click on the frontend service
2. Go to "Settings" tab
3. **CRITICAL**: Set **Root Directory** to: `frontend`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm start`
6. Click "Save Changes"

### Step 3: Set Environment Variables
Go to "Variables" tab and add:

```
VITE_API_URL=https://your-backend-url.railway.app/api
NODE_ENV=production
```

Replace `your-backend-url` with the URL from Backend deployment.

### Step 4: Update Frontend API Configuration
You need to update the frontend to use the environment variable:

In `frontend/src/lib/api.ts`, change:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live!

---

## 🔄 UPDATE BACKEND CORS

After frontend is deployed:
1. Go to backend service → Variables
2. Update `CORS_ORIGIN` with your actual frontend URL
3. Redeploy backend

---

## ✅ VERIFICATION

1. Visit your frontend URL
2. Try to register/login
3. Add an expense
4. Check if everything works

---

## 🐛 TROUBLESHOOTING

### Backend won't start
- Check logs in Railway dashboard
- Verify all environment variables are set
- Ensure `npm run build` completes successfully

### Frontend can't connect to backend
- Check CORS_ORIGIN in backend matches frontend URL
- Verify VITE_API_URL in frontend points to backend
- Check browser console for errors

### Database issues
- Current setup uses JSON file (not ideal for production)
- Consider adding PostgreSQL:
  1. In Railway, click "New" → "Database" → "PostgreSQL"
  2. Update backend to use PostgreSQL instead of JSON
  3. Add DATABASE_URL to backend variables

---

## 💡 TIPS

1. **Custom Domain**: Add your own domain in Railway settings
2. **Auto Deploy**: Railway auto-deploys on git push
3. **Logs**: Check logs in Railway dashboard for debugging
4. **Monitoring**: Railway provides metrics and monitoring

---

## 🔐 SECURITY CHECKLIST

- ✅ Strong JWT_SECRET (256-bit random)
- ✅ CORS configured correctly
- ✅ NODE_ENV=production
- ✅ No sensitive data in code
- ✅ .env files not committed to git

---

## 📊 COST

Railway provides:
- $5 free credit per month
- Pay only for what you use after that
- Estimated cost: $5-10/month for both services

---

## 🎉 DONE!

Your expense tracker is now live on Railway!

**Next Steps:**
- Share your app URL
- Add custom domain
- Monitor usage
- Consider migrating to PostgreSQL for production
