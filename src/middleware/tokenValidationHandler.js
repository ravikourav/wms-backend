import expressAsyncHandler from "express-async-handler";
import jwt from 'jsonwebtoken';

const validateToken = (role) => expressAsyncHandler(async (req, res, next) => {
  const token = req.cookies.authToken;
  
  if (token) {
    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          res.status(401).json({ message: 'User is not authorized' });
          return;
        }
        req.user = decoded.user;
        if (role.includes(req.user.role)) {
          next();
        } else {
          res.status(403).json({ message: 'Forbidden' });
        }
      });
    } catch (error) {
      res.status(401).json({ message: 'Token verification failed' });
    }
  } else {
    res.status(401).json({ message: 'Token not found' });
  }
});

export default validateToken;
