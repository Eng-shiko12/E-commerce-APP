import jwt from 'jsonwebtoken';
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
    return accessToken;
}
export default generateTokens;