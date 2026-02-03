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
  'http://localhost:5174', // current local port
  'https://phantom-theta-gray.vercel.app',
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

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ Root route
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
