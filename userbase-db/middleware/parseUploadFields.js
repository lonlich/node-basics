import upload from "../middleware/multer-config.js";


export const parseUploadFields = upload.fields([
    {
        name: 'files',
        maxCount: 3
    },
])