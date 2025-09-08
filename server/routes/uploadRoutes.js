// server/routes/uploadRoutes.js
const router = require('express').Router();
const { upload } = require('../utils/upload');
const { authenticateHallManager } = require('../middlewares/auth');
const fs = require('fs/promises');

router.post('/hall-images',
  authenticateHallManager,
  upload.array('images', 5),
  (req, res) => {
    try {
      const files = req.files || [];
      const baseURL = `${req.protocol}://${req.get('host')}`;
      const urls = files.map(f => `${baseURL}/uploads/halls/${f.filename}`);
      return res.status(201).json({ success: true, urls });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Upload failed', details: err.message });
    }
  }
);


// NEW: delete endpoint (supports single or multiple URLs)
router.post('/hall-images/delete',
  authenticateHallManager,
  async (req, res) => {
    try {
      let { urls } = req.body;
      if (!urls) return res.status(400).json({ success: false, error: 'urls is required' });
      if (!Array.isArray(urls)) urls = [urls];

      const deletions = [];
      for (const url of urls) {
        try {
          const parsed = new URL(url);
          // Only allow deletion from /uploads/halls/*
          if (!parsed.pathname.startsWith('/uploads/halls/')) {
            deletions.push({ url, deleted: false, reason: 'Invalid path' });
            continue;
          }
          const filename = path.basename(parsed.pathname); // prevents path traversal
          const filePath = path.join(__dirname, '..', 'uploads', 'halls', filename);

          // Double-check the resolved path is inside our uploads dir
          const uploadsDir = path.join(__dirname, '..', 'uploads', 'halls');
          const resolved = path.resolve(filePath);
          if (!resolved.startsWith(path.resolve(uploadsDir))) {
            deletions.push({ url, deleted: false, reason: 'Path check failed' });
            continue;
          }

          await fs.unlink(resolved).catch(err => {
            // If file is already gone, treat as success (idempotent)
            if (err.code !== 'ENOENT') throw err;
          });
          deletions.push({ url, deleted: true });
        } catch (err) {
          deletions.push({ url, deleted: false, reason: err.message });
        }
      }

      const allOk = deletions.every(d => d.deleted);
      return res.status(allOk ? 200 : 207).json({ success: allOk, results: deletions });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Delete failed', details: err.message });
    }
  }
);

module.exports = router;
