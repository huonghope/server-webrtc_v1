const multer = require('multer');
const uuidv4 = require('uuid/v4');
const path = require('path');
const { fileDirectory, fileLimitSize } = require('../../../modules/vars')

module.exports = {
  storage: new multer.diskStorage({
    destination:(req, file, callback) => {
      callback(null, fileDirectory)
    },
    filename: (req, file, callback) => {
      const fileTypes = /pdf|docx|xlsx|csv|txt/
      const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
      if(extname){
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        return callback(null, `${uniqueSuffix}-${file.originalname}`);
      }
      callback(
        `File upload only supports the following filetypes - ${fileTypes}`,
        null,
      )
    }
  }),
  limits: { fileSize: fileLimitSize}
} 