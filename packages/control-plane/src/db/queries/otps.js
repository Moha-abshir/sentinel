const db = require('../index');

const saveOTP = async (email, code) => {
    await db.query(`
        INSERT INTO otp_codes (email, code, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '5 minutes')
    `, [email, code]);
};

const findValidOTP = async (email, code) => {
    const result = await db.query(`
        SELECT * FROM otp_codes 
        WHERE email = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
        ORDER BY created_at DESC LIMIT 1
    `, [email, code]);
    return result.rows[0];
};

const markOTPAsUsed = async (id) => {
    await db.query(`UPDATE otp_codes SET used = TRUE WHERE id = $1`, [id]);
};

const cleanupExpiredOTPs = async () => {
    await db.query(`DELETE FROM otp_codes WHERE expires_at < NOW() OR used = TRUE`);
};

module.exports = {
    saveOTP,
    findValidOTP,
    markOTPAsUsed,
    cleanupExpiredOTPs
};
