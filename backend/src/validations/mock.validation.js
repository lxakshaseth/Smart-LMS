const Joi = require("joi");

const generateMockSchema = Joi.object({
  subject: Joi.string().min(2).required()
});

const submitMockSchema = Joi.object({
  subject: Joi.string().required(),
  questions: Joi.array().items(
    Joi.object({
      question: Joi.string().required(),
      options: Joi.array().items(Joi.string()).length(4).required(),
      correctAnswer: Joi.string().required()
    })
  ).required(),
  userAnswers: Joi.array().items(Joi.string()).required()
});

module.exports = {
  generateMockSchema,
  submitMockSchema
};
