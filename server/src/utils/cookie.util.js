import envConfig from "../config/env.config.js";

export const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: envConfig.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: envConfig.ACCESS_TOKEN_COOKIE_MAX_AGE,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: envConfig.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: envConfig.REFRESH_TOKEN_COOKIE_MAX_AGE,
  });
};

export const clearCookies = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};
