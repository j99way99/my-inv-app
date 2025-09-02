// Image upload functionality temporarily disabled
module.exports = {
  upload: null,
  resizeAndUploadToS3: null
};

// Temporarily disabled code:
/*
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

*/