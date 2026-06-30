// BACKEND/config/multer.js
import multer from "multer";


const multerLoader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

export default multerLoader;