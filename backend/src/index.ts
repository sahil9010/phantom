import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './services/socket';
import authRoutes from './routes/auth';
import projectRoutes from './routes/project';
import issueRoutes from './routes/issue';
import commentRoutes from './routes/comment';
import userRoutes from './routes/user';
import invitationRoutes from './routes/invitation';
import settingsRoutes from './routes/settings';
import roleRoutes from './routes/role';
import notificationRoutes from './routes/notification';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(server);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ CORS setup for local dev + Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://192.168.1.25:5174',
  'https://phantom-theta-gray.vercel.app',
  'https://pm.sahilmaharjan1.com.np',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowed =>
      origin === allowed || origin.startsWith(allowed)
    );

    if (isAllowed || origin.includes('192.168.')) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

// ✅ Root route
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// ✅ Keep-alive logic (Self-pinging)
const SELF_URL = 'https://phantom-backend-qmci.onrender.com';
const interval = 14 * 60 * 1000; // 14 minutes

function reloadWebsite() {
  const https = require('https');
  https.get(SELF_URL, (res: any) => {
    console.log(`Self-ping at ${new Date().toISOString()}: Status Code ${res.statusCode}`);
  }).on('error', (err: any) => {
    console.error(`Self-ping error at ${new Date().toISOString()}:`, err.message);
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start self-pinging every 14 minutes to keep the server awake
  setInterval(reloadWebsite, interval);
});

export default app;
