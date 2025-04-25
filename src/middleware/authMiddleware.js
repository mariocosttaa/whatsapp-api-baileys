require('dotenv').config();

const validateApiKey = (req, res, next) => {
    const apiKey = req.header('API_KEY');

    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            error: 'Unauthorized - Invalid API Key'
        });
    }

    next();
};

module.exports = validateApiKey;
