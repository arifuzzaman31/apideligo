import Joi from 'joi';

const createCategorySchema = Joi.object({
  categoryName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.base': 'Category name must be a string',
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters',
      'string.max': 'Category name must be at most 50 characters',
      'any.required': 'Category name is required'
    }),
    
  icon: Joi.string()
    .uri()
    .required()
    .messages({
      'string.base': 'Icon must be a string',
      'string.empty': 'Icon URL is required',
      'string.uri': 'Icon must be a valid URL',
      'any.required': 'Icon URL is required'
    }),
    
  type: Joi.string()
    .valid('expense', 'income')
    .optional()
    .messages({
      'string.base': 'Type must be a string'
    })
});

export default createCategorySchema