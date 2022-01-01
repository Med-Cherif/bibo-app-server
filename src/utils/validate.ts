import Joi from "joi"

export const userSchema = Joi.object({
    username: Joi.string().required().pattern(new RegExp(/^[a-z0-9_\.]+$/)),
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().required().min(6),
    confirmPassword: Joi.ref('password'),
    birthday: Joi.string().required().pattern(new RegExp(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/)),
    gender: Joi.string().required().valid('male', 'female', 'prefer not to say'),
    country: Joi.any()
})