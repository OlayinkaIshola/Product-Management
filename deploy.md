
### 2. Backend Deployment (Render.com)

1. **Create Render Account:**
   - Go to https://render.com
   - Sign up with GitHub account

2. **Deploy Backend:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository: `OlayinkaIshola/Product-Management`
   - Settings:
     - Name: `product-management-backend`
     - Root Directory: `backend`
     - Environment: `Node`
     - Build Command: `npm install && npx prisma generate`
     - Start Command: `npm start`

3. **Add Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=Shakushaku1
   JWT_EXPIRE=30d
   CLIENT_URL=https://your-frontend-url.netlify.app
   ```

4. **Add PostgreSQL Database:**
   - In Render dashboard, click "New +" → "PostgreSQL"
   - Name: `product-management-db`
   - Copy the DATABASE_URL and add it to your web service environment variables

### 3. Frontend Deployment (Netlify)

1. **Create Netlify Account:**
   - Go to https://netlify.com
   - Sign up with GitHub account

2. **Deploy Frontend:**
   - Click "New site from Git"
   - Choose GitHub and select `OlayinkaIshola/Product-Management`
   - Settings:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `frontend/dist`

3. **Add Environment Variables:**
   - Go to Site settings → Environment variables
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     VITE_SOCKET_URL=https://your-backend-url.onrender.com
     ```

4. **Configure Redirects:**
   - The `netlify.toml` file is already configured for SPA routing

### 4. Database Setup

1. **Run Migrations:**
   - In Render backend service, go to "Shell"
   - Run: `npx prisma migrate deploy`
   - Run: `npx prisma db seed`

### 5. Update URLs

1. **Update netlify.toml:**
   - Replace `https://your-backend-url.herokuapp.com` with your actual Render backend URL

2. **Update backend CORS:**
   - In `backend/server.js`, update CLIENT_URL environment variable

### 6. Test Deployment

1. **Access your app:**
   - Frontend: `https://your-app-name.netlify.app`
   - Backend API: `https://your-backend-name.onrender.com/api/health`

2. **Test login:**
   - Email: `john@example.com`
   - Password: `password123`

## 🔧 Local Development

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev:frontend  # Terminal 1
npm run dev:backend   # Terminal 2

# Access locally
Frontend: http://localhost:5173
Backend: http://localhost:5000
```

## 📝 Environment Variables Summary

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_EXPIRE="30d"
NODE_ENV="production"
PORT=5000
CLIENT_URL="https://your-frontend-url.netlify.app"
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

## 🎯 Features Included

✅ User Authentication (Register/Login)
✅ Board Management (Create/Edit/Delete)
✅ Task Management with Drag & Drop
✅ Real-time Collaboration (Socket.io)
✅ Team Member Invitations
✅ Analytics Dashboard
✅ Dark Mode Support
✅ Mobile Responsive Design
✅ Production Ready Deployment

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Ensure CLIENT_URL in backend matches frontend URL
   - Check Netlify environment variables

2. **Database Connection:**
   - Verify DATABASE_URL is correct
   - Run migrations: `npx prisma migrate deploy`

3. **Socket.io Issues:**
   - Ensure VITE_SOCKET_URL matches backend URL
   - Check WebSocket support on hosting platform

4. **Build Failures:**
   - Check Node.js version (use 18.x)
   - Verify all dependencies are installed
   - Check environment variables are set

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Check backend logs in Render dashboard
3. Verify all environment variables are set correctly
4. Ensure database migrations have run successfully
