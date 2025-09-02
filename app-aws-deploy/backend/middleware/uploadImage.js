const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
// const sharp = require('sharp'); // Temporarily disabled
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// S3 클라이언트 설정
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 메모리 스토리지 사용 (리사이징을 위해)
const storage = multer.memoryStorage();

// 파일 필터 (이미지만 허용)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

// Multer 설정
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
});

// 이미지 리사이징 및 S3 업로드 함수
const resizeAndUploadToS3 = async (file, userId) => {
  const bucketName = process.env.AWS_S3_BUCKET || 'my-inv-app-images';
  const fileName = `${userId}/${uuidv4()}${path.extname(file.originalname)}`;
  const thumbnailFileName = `${userId}/thumb_${uuidv4()}${path.extname(file.originalname)}`;
  
  try {
    // 원본 이미지 업로드
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    
    // 원본 이미지 S3 업로드
    const originalCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: `items/original/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });
    
    await s3Client.send(originalCommand);
    
    // 썸네일 생성 (가로 100px) - Temporarily disabled
    // const thumbnailBuffer = await sharp(file.buffer)
    //   .resize(100, null, {
    //     withoutEnlargement: true,
    //     fit: 'inside',
    //   })
    //   .jpeg({ quality: 80 })
    //   .toBuffer();
    
    // For now, use original image as thumbnail
    const thumbnailBuffer = file.buffer;
    
    // 썸네일 S3 업로드
    const thumbnailCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: `items/thumbnails/${thumbnailFileName}`,
      Body: thumbnailBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    });
    
    await s3Client.send(thumbnailCommand);
    
    // URL 반환
    const region = process.env.AWS_REGION || 'ap-northeast-2';
    const originalUrl = `https://${bucketName}.s3.${region}.amazonaws.com/items/original/${fileName}`;
    const thumbnailUrl = `https://${bucketName}.s3.${region}.amazonaws.com/items/thumbnails/${thumbnailFileName}`;
    
    return {
      originalUrl,
      thumbnailUrl,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

module.exports = {
  upload,
  resizeAndUploadToS3,
};