import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

// Middleware that attaches req.user if token is valid, but doesn't block if not
const optionalToken = expressAsyncHandler(async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next(); // Allow access without token
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
      return next(); // Invalid token — ignore, proceed without user
    }

    req.user = decoded.user; // Attach decoded user
    next();
  });
});

export default optionalToken;
