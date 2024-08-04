import { type H3Event } from 'h3';
import { z } from 'zod';
import { isMultipartFile } from '@@/server/utils/multipart';

const validationBasic = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.string().trim().min(1, 'Enter your email address').email('Invalid email address'),
  gender: z
    .string()
    .min(1, 'Choose your gender')
    .refine((v) => ['male', 'female'].includes(v), 'Invalid gender'),
  address: z.string().trim().min(1, 'Enter your address')
});

const validationAdvanced = z.object({
  photo: z.any().refine((v) => isMultipartFile(v), 'Please upload photo'),
  hobbies: z.array(z.string(), { required_error: 'Please enter your hobbies' }).min(1, 'Please enter your hobbies'),
  country: z.coerce.number().min(1, 'Please select country'),
  language: z.string().min(2, 'Please select language'),
  security: z.coerce.boolean()
});

/**
 * Post JSON data
 * @param event - H3Event
 */
async function json(event: H3Event) {
  try {
    await useValidateBody(event, { schema: validationBasic });

    const data = {
      success: true
    };

    return {
      data
    };
  } catch (err: any) {
    throw sendErrorServer(event, err);
  }
}

/**
 * Post form data
 * @param event - H3Event
 */
async function formData(event: H3Event) {
  try {
    const { data: body } = await useValidateBody(event, { schema: validationAdvanced });
    console.log(body);

    const data = {
      success: true
    };

    return {
      data
    };
  } catch (err: any) {
    throw sendErrorServer(event, err);
  }
}

export default {
  json,
  formData
};
