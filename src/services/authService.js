const jwt = require("jsonwebtoken");

const SECRET = "SECRET_KEY_KAMU"; // nanti simpan di .env

exports.generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        SECRET,
        { expiresIn: "1d" }
    );
};