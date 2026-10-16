const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const fileFilter = (_req, file, cb) => {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(new Error("Only JPG, PNG, WEBP or GIF images are allowed"));
  cb(null, true);
};
module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 8 } });
