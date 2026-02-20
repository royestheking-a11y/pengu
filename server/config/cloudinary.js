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
        const isRaw = ['pdf', 'doc', 'docx', 'zip'].includes(file.mimetype.split('/')[1]);
        return {
            folder: 'penguproject',
            resource_type: isRaw ? 'raw' : 'auto',
            public_id: file.originalname.split('.')[0] + '-' + Date.now(), // Ensure unique filenames
        };
    },
});

export { cloudinary, storage };
