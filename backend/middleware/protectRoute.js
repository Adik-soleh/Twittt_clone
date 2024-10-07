import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) {
            return res.status(401).json({error: "Unauthorized: Tidak Ada Token yang Disediakan"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded) {
            return res.status(401).json({error: "Unauthorized: Token Tidak Valid"});
        }

        const user = await User.findById(decoded.userId).select("-password");

        if(!user) {
            return res.status(400).json({error: "Pengguna tidak ditemukan"});
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error pada protectRoute middleware", error.message);
        return res.status(500).json({error: "internal server error"})
        
    }
}