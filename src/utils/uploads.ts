import multer from "multer";
import path from "path";
import crypto from "crypto"
import { Request } from "express";
import fs from "fs";

function handleMulter(dest: string) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.resolve('uploads', dest)
            const isFolderExists = fs.existsSync(dir)
            if (!isFolderExists) {
                fs.mkdirSync(dir, { recursive: true })
            }
            
            cb(null, path.join('uploads', dest))
        },
        filename: (req, file, cb) => {
            cb(null, crypto.randomBytes(16).toString('hex') + '-' + file.originalname)
        }
    })

    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        const { mimetype } = file
        if (mimetype === 'image/jpeg' || mimetype === 'image/png' || mimetype === "image/jpg") {
            cb(null, true)
        } else {
            cb(new Error('Invalid image type'))
        }
    }

    return multer({ storage, fileFilter })

}
    
export const uploadPostImages = handleMulter('post-images')
