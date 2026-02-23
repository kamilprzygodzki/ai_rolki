import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { isValidMimeType, getMaxFileSize } from '../utils/validators';

const uploadDir = process.env.UPLOAD_DIR || './uploads';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (isValidMimeType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Nieobsługiwany format pliku: ${file.mimetype}. Dozwolone: MP4, MOV, AVI, WebM, MKV, MPEG`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: getMaxFileSize(),
  },
});
