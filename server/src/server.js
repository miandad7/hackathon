const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const aiRoutes = require('./routes/aiRoutes');

const Complaint = require('./models/Complaint');
const { seedData } = require('./seed');

const app = express();

// Connect Database & seed if empty
connectDB().then(async () => {
  try {
    const count = await Complaint.countDocuments();
    if (count === 0) {
      console.log('No complaints found on server boot. Auto-seeding initial dataset...');
      await seedData(false);
    }
  } catch (err) {
    console.warn('Auto-seed check warning:', err.message);
  }
});

// Middleware
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: [clientOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ai', aiRoutes);

// Base route test
app.get('/', (req, res) => {
  res.json({ message: 'Citizen Complaint Portal API is running...' });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
