const jwt = require('jsonwebtoken');
const handleErrors = require('../../errors/errors');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1].replace(/"/g,"");
        if (!token) {
            return handleErrors(req, res, 401, 'Not found access token')
        };

        const decoded = await jwt.verify(token, process.env.SECRET_JSON_WEB);

        req.userId = decoded.userId;
        next();

    } catch (error) {
        console.log(error);
        handleErrors(req, res, 401, 'Internal server out');
    }
};

module.exports = verifyToken;
