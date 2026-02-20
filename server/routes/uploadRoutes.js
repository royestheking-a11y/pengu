import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const router = express.Router();
const upload = multer({ storage });

router.post('/', (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(400).json({
                error: 'Upload failed',
                message: err.message,
                code: err.code
            });
        }
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        res.send({
            url: req.file.path,
            name: req.file.originalname,
            format: req.file.mimetype,
            size: req.file.size
        });
    });
});

export default router;
