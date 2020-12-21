const Joi = require('joi');

module.exports = {
  createMessage: {
    body: {
      text: Joi.string(),
      receiver: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
      conversationType: Joi.string()
        .valid(String)
        .required(),
      type: Joi.string().valid(String),
      message: Joi.string(),
      images: Joi.array().max(50),
      files: Joi.array().max(50),
    },
  },
  getConversation: {
    params: {
      receiverId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
    query: {
      skip: Joi.number().min(0),
      limit: Joi.number().min(1).max(50),
    },
  },
  imagesList: {
    query: {
      skip: Joi.number().min(0),
      limit: Joi.number().min(1).max(50),
      id: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
  },
  filesList: {
    query: {
      skip: Joi.number().min(0),
      limit: Joi.number().min(1).max(50),
      id: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    },
  },
};
