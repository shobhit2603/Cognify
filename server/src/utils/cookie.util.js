import envConfig from "../config/env.config.js";

const getCookieOptions = (req = null) => {
  const isProd = envConfig.NODE_ENV === "production";
  const baseOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  };

  // If a request object is passed and origin doesn't match the server's own origin/localhost,
  // or cross-site is explicitly forced in production:
  if (isProd && process.env.IS_CROSS_SITE === "true") {
    return {
      ...baseOptions,
      secure: true, // none requires secure
      sameSite: "none",
    };
  }

  return baseOptions;
};

export const setCookies = (res, accessToken, refreshToken, req = null) => {
  const cookieOptions = getCookieOptions(req);

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: envConfig.ACCESS_TOKEN_COOKIE_MAX_AGE,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: envConfig.REFRESH_TOKEN_COOKIE_MAX_AGE,
  });
};

export const clearCookies = (res, req = null) => {
  const cookieOptions = getCookieOptions(req);
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};
