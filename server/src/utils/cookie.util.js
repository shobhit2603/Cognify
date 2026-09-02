import envConfig from "../config/env.config.js";

const getCookieOptions = (req) => {
  const isProd = envConfig.NODE_ENV === "production";
  const baseOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
  };

  // If a request object is passed and origin doesn't match the server's own origin/localhost,
  // we might be cross-site. Since the API handles CORS based on ALLOWED_ORIGINS,
  // if ALLOWED_ORIGINS does not match the server's domain in production, it's cross-site.
  // For safety and compatibility with cross-site setups (like frontend on Vercel, backend on Render):
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
