const jwt = require('jsonwebtoken');
require('dotenv').config({ path: __dirname + '/../db/.env' });

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Header should be formatted as "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_if_env_fails';

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token." });
        }
        
        // Attach the verified user payload to the request object
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
