import envConfig from "../config/env.config.js";

/**
 * sameSite: 'lax' is intentional.
 *
 * 'strict' breaks OAuth redirect flows: when Google redirects back to our
 * server callback and we then redirect to the client, the browser treats that
 * as a cross-site navigation and refuses to send 'strict' cookies on the very
 * next request (/auth/me), causing an instant 401.
 *
 * 'lax' allows cookies to be sent on top-level navigations (redirects) while
 * still blocking them on cross-site sub-resource requests (fetch/XHR), which
 * is the correct security posture for HttpOnly auth cookies.
 */
export const setCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: envConfig.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: envConfig.ACCESS_TOKEN_COOKIE_MAX_AGE,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: envConfig.REFRESH_TOKEN_COOKIE_MAX_AGE,
  });
};

export const clearCookies = (res) => {
  res.clearCookie("accessToken", { httpOnly: true, sameSite: "lax" });
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "lax" });
};
