// server/utils/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'halls');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9_-]/gi, '_')
      .slice(0, 40);
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ok = ['image/jpeg','image/png','image/webp','image/jpg'].includes(file.mimetype);
  cb(ok ? null : new Error('Only JPG/PNG/WEBP images allowed'), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 5 } // 2MB per image, max 5
});

module.exports = { upload, UPLOAD_DIR };
