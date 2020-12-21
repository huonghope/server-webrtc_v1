const path = require('path')

// import .env variables
require('dotenv-safe').config({
  path: path.join(__dirname, '../../.env'),
  example: path.join(__dirname, '../../.env.example'),
  allowEmptyValues: true
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',

  // avatarDirectory: process.env.AVATAR_DIRECTORY,
  // avatarTypes: ['image/png', 'image/jpg', 'image/jpeg'],
  // avatarLimitSize: 8097152, // 1mb
  // photoDirectory: process.env.PHOTOS_DIRECTORY,
  // photoTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
  // photoLimitSize: 8097152,
  fileDirectory: process.env.FILES_DIRECTORY,
  fileLimitSize: 8097152,
  // fileTypes: ["image/png", "image/jpg", "image/jpeg"],
  staticUrl: process.env.STATIC_URL,
}
