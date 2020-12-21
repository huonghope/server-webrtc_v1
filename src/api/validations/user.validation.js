const Joi = require('joi');

module.exports = {
  // GET /v1/users
  listUsers: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string(),
      email: Joi.string(),
    },
  },

  // PATCH /v1/users/:userId
  updateUser: {
    body: {
      email: Joi.string().email(),
      firstname: Joi.string().max(128),
      lastname: Joi.string().max(128),
    },
  },

};
