require('dotenv').config();

const validateApiKey = (req, res, next) => {
    const apiKey = req.header('Authorization');

    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            error: 'Unauthorized - Invalid API Key'
        });
    }

    next();
};

module.exports = validateApiKey;
