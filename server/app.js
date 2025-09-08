const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const apiRouter = require('./routes/index');
const dotenv = require('dotenv');
// server/app.js
const path = require('path');
const uploadRoutes = require('./routes/uploadRoutes');


dotenv.config();
const app = express();


app.get('/', async (req, res) => {
  res.send("Server Runing")
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1', apiRouter);
// static hosting for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/upload', uploadRoutes);
app.listen(process.env.PORT, () => {
  console.log('Server is running on http://localhost:3000');
});
