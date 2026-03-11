import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        console.log(`📡 [CLOUDINARY CONFIG] Processing file: ${file.originalname} (${file.mimetype})`);
        const isPdf = file.originalname.toLowerCase().endsWith('.pdf') || file.mimetype === 'application/pdf';
        return {
            folder: 'penguproject',
            resource_type: isPdf ? 'raw' : 'auto',
            public_id: file.originalname.split('.')[0] + '-' + Date.now(), 
        };
    },
});

export { cloudinary, storage };
