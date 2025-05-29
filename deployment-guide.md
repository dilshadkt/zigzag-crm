# Chat Application Deployment Guide

## Architecture Overview

Your chat application consists of:

- **Frontend**: React app (CRM folder)
- **Backend**: Node.js + Express + Socket.IO (CRM-API folder)
- **Database**: MongoDB
- **Real-time**: Socket.IO for live messaging

## Hosting Options

### Option 1: Single Server Hosting (Easiest)

Host both frontend and backend on the same server using a reverse proxy.

#### Structure:

```
Your Server (e.g., DigitalOcean, AWS EC2, VPS)
├── Frontend (React build) → Port 80/443 (via Nginx)
├── Backend API → Port 5000
├── Socket.IO → Same port 5000
└── MongoDB → Port 27017 (local) or MongoDB Atlas (cloud)
```

#### Setup Steps:

1. **Build React App for Production:**

```bash
cd CRM
npm run build
```

2. **Nginx Configuration** (`/etc/nginx/sites-available/your-domain`):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve React build files
    location / {
        root /var/www/crm/build;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy Socket.IO connections
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **PM2 Process Manager** (to keep backend running):

```bash
# Install PM2
npm install -g pm2

# Start backend
cd CRM-API
pm2 start server.js --name "crm-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 2: Separate Hosting (More Scalable)

#### Frontend Hosting Options:

- **Vercel** (recommended for React)
- **Netlify**
- **AWS S3 + CloudFront**
- **GitHub Pages**

#### Backend Hosting Options:

- **Railway** (easy deployment)
- **Heroku** (simple but paid)
- **DigitalOcean App Platform**
- **AWS EC2**
- **Google Cloud Run**

### Option 3: Docker Deployment (Professional)

Create a `docker-compose.yml` in your root directory:

```yaml
version: "3.8"
services:
  frontend:
    build: ./CRM
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - backend

  backend:
    build: ./CRM-API
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/crm
      - JWT_SECRET=your-secret-key
      - PORT=5000
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## Database Options

### Option A: MongoDB Atlas (Cloud - Recommended)

- Free tier available
- Automatic backups
- Global distribution
- No server maintenance

### Option B: Self-hosted MongoDB

- Install on your server
- More control
- Requires maintenance

## Environment Configuration

### Frontend (.env in CRM folder):

```env
REACT_APP_API_URL=https://your-api-domain.com
# or for same server: REACT_APP_API_URL=https://your-domain.com
```

### Backend (.env in CRM-API folder):

```env
MONGODB_URI=mongodb://localhost:27017/crm
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/crm

JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=production
```

## Recommended Simple Setup

For a small to medium application, I recommend:

1. **Single VPS Server** (DigitalOcean $5-10/month)
2. **MongoDB Atlas** (Free tier)
3. **Nginx** as reverse proxy
4. **PM2** for process management
5. **Let's Encrypt** for SSL

This gives you:

- ✅ Everything in one place
- ✅ Easy to manage
- ✅ Cost-effective
- ✅ Scalable when needed
- ✅ Real-time chat works perfectly

## Socket.IO Considerations

Socket.IO works great with all these setups, but remember:

- Use sticky sessions if you scale to multiple backend instances
- Configure CORS properly for cross-origin requests
- Ensure WebSocket connections can upgrade properly through your proxy

Would you like me to help you set up any specific hosting option?
