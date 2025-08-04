// middleware/upload.js
import multer from 'multer';

// const upload = multer({ dest: 'uploads/' });

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

export default upload;
