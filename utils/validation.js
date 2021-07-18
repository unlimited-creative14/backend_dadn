const joi = require('@hapi/joi');

const registerValidation = (data) => {
    const schema = joi.object({
        email: joi.string().min(8).required().email(),
        password: joi.string().min(8).required(),
    });
    return schema.validate(data);
};

const loginValidation = (data) => {
    const schema = joi.object({
        email: joi.string().min(8).required().email(),
        password: joi.string().min(8).required(),
    });
    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
