import { Joi } from 'express-validation';

export const dockerBuildPayloadValidation = {
  body: Joi.object({
    imageName: Joi.string().required(),
    tag: Joi.string().required(),
    dockerRegistry: Joi.string(),
    expose: Joi.number(),
  }),
}
