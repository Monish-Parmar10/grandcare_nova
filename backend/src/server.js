import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { startCronJobs } from './cron.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import routineRoutes from './routes/routineRoutes.js';
import helpRequestRoutes from './routes/helpRequestRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import moodRoutes from './routes/moodRoutes.js';
import healthProfileRoutes from './routes/healthProfileRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();


connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('GrandCare API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/help-requests', helpRequestRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/health-profile', healthProfileRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('chat:join', (requestId) => {
    const room = `room_helpRequest_${requestId}`;
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('chat:message', (data) => {
    const { requestId, message } = data;
    const room = `room_helpRequest_${requestId}`;
    // Broadcast to others in the room
    socket.to(room).emit('chat:message', message);

    // In a full implementation, we'd also save this to DB here 
    // or rely on the client to hit the REST endpoint to save it.
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start cron jobs
startCronJobs();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
