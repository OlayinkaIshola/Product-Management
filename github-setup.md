# GitHub Repository Setup Guide

## 🚀 Complete GitHub Setup Instructions

### Step 1: Create GitHub Repository

1. **Go to GitHub:**
   - Open https://github.com/new in your browser
   - Make sure you're logged in as **OlayinkaIshola**

2. **Repository Settings:**
   - Repository name: `Product-Management`
   - Description: `A comprehensive Trello-style project management tool built with React, Node.js, and PostgreSQL`
   - Set to **Public**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click **"Create repository"**

### Step 2: Push Your Code

After creating the repository, run these commands in your terminal:

```bash
# Navigate to your project directory
cd "C:\Users\USER\Desktop\Apps\Projectmanagement"

# Check current status
git status

# If you need to add the remote again (if it failed)
git remote add origin https://github.com/OlayinkaIshola/Product-Management.git

# Push to GitHub
git push -u origin main
```

### Step 3: If Authentication is Required

If Git asks for authentication, you have several options:

#### Option A: GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not installed
# Then authenticate
gh auth login

# Push using GitHub CLI
gh repo create OlayinkaIshola/Product-Management --public --source=. --remote=origin --push
```

#### Option B: Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with repo permissions
3. Use your username and the token as password when prompted

#### Option C: GitHub Desktop
1. Download GitHub Desktop
2. Add your local repository
3. Publish to GitHub

### Step 4: Verify Upload

After successful push, verify at:
https://github.com/OlayinkaIshola/Product-Management

You should see all your files including:
- frontend/ folder
- backend/ folder
- README.md
- deploy.md
- package.json
- All other project files

## 🌐 Next Steps After GitHub Upload

### 1. Deploy Backend to Render

1. **Sign up at Render.com:**
   - Go to https://render.com
   - Sign up with your GitHub account (OlayinkaIshola)

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub and select `Product-Management` repository
   - Configure:
     ```
     Name: product-management-backend
     Root Directory: backend
     Environment: Node
     Build Command: npm install && npx prisma generate
     Start Command: npm start
     ```

3. **Add PostgreSQL Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `product-management-db`
   - Copy the connection string

4. **Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   DATABASE_URL=[paste your postgres connection string]
   CLIENT_URL=https://your-app-name.netlify.app
   ```

### 2. Deploy Frontend to Netlify

1. **Sign up at Netlify:**
   - Go to https://netlify.com
   - Sign up with your GitHub account

2. **Deploy Site:**
   - Click "New site from Git"
   - Choose GitHub → Select `Product-Management`
   - Configure:
     ```
     Base directory: frontend
     Build command: npm run build
     Publish directory: frontend/dist
     ```

3. **Environment Variables:**
   - Go to Site settings → Environment variables
   - Add:
     ```
     VITE_API_URL=https://your-backend-name.onrender.com
     VITE_SOCKET_URL=https://your-backend-name.onrender.com
     ```

### 3. Final Steps

1. **Run Database Migrations:**
   - In Render backend service, go to "Shell"
   - Run: `npx prisma migrate deploy`
   - Run: `npx prisma db seed`

2. **Test Your App:**
   - Frontend: `https://your-app-name.netlify.app`
   - Backend: `https://your-backend-name.onrender.com/api/health`
   - Login with: `john@example.com` / `password123`

## 🔧 Troubleshooting

### Git Push Issues:
- Make sure the GitHub repository exists
- Check your internet connection
- Verify GitHub credentials
- Try using GitHub Desktop as alternative

### Deployment Issues:
- Check build logs in Netlify/Render dashboards
- Verify environment variables are set correctly
- Ensure Node.js version is 18.x
- Check that all dependencies are listed in package.json

## 📞 Support

If you encounter any issues:
1. Check the error messages in terminal
2. Verify GitHub repository was created successfully
3. Ensure you have proper permissions
4. Try alternative authentication methods

Your project is ready for deployment! 🎉
