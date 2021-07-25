const joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');

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

const verifyToken = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token)
        return res.status(401).send({
            message: 'Unauthorized',
            code: 401,
        });
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};


module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.verifyToken = verifyToken;
