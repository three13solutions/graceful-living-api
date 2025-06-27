import Joi from 'joi';

const applicationSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  // Add all other expected fields
}).unknown(false); // Rejects unknown fields

async function validateFormData(formData) {
  try {
    await applicationSchema.validateAsync(formData, { abortEarly: false });
  } catch (error) {
    const errors = error.details.map(detail => ({
      field: detail.context.key,
      message: detail.message
    }));
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }
}

export { validateFormData };
