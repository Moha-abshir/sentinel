const db = require('../index');

const createUser = async (email) => {
    const result = await db.query(`
        INSERT INTO users (email) 
        VALUES ($1) RETURNING *
    `, [email]);
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return result.rows[0];
};

const updateUser = async (id, data) => {
    // In a real app, this would dynamically build the SET clause based on data
    // For now, since we only have email, we'll just allow updating email
    if (data.email) {
        const result = await db.query(`
            UPDATE users SET email = $1, updated_at = NOW() 
            WHERE id = $2 RETURNING *
        `, [data.email, id]);
        return result.rows[0];
    }
};

const deleteUser = async (id) => {
    await db.query(`DELETE FROM users WHERE id = $1`, [id]);
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
    deleteUser
};
