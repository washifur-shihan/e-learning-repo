"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
require("dotenv").config();
const redis_1 = require("./redis");
// parse environment variables to integrate with fallback values
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);
// options for cookies 
exports.accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000 * 1000 * 10000),
    maxAge: accessTokenExpire * 60 * 60 * 1000 * 1000 * 10000,
    httpOnly: true,
    sameSite: 'lax',
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000 * 1000 * 10000),
    maxAge: refreshTokenExpire * 60 * 60 * 24 * 1000 * 1000 * 10000,
    httpOnly: true,
    sameSite: 'lax',
};
// only set secure to true and sameSite to none in production to support cross-site cookies (Vercel frontend)
if (process.env.NODE_ENV === 'production') {
    exports.accessTokenOptions.secure = true;
    exports.refreshTokenOptions.secure = true;
    exports.accessTokenOptions.sameSite = 'none';
    exports.refreshTokenOptions.sameSite = 'none';
}
const sendToken = (user, statusCode, res) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    // upload session to redis database to maintain cache
    redis_1.redis.set(user._id, JSON.stringify(user));
    res.cookie("access_token", accessToken, exports.accessTokenOptions);
    res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
};
exports.sendToken = sendToken;
