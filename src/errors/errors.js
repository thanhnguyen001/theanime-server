
const handleErrors = (req, res, errorCode, message) => {
    return res.status(errorCode).json({
        success: false,
        message
    })
};

module.exports = handleErrors;