import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const destinationPath = process.env.NODE_ENV === 'production' ? '/tmp' : './tmp';
      cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

export const upload = multer({ storage });
