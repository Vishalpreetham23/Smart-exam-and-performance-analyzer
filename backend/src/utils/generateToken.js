import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Since we also have roles, we can return the token to be stored on client side
  // or store in HttpOnly cookie. For standard MERN apps with separate domains,
  // we'll primarily use the Authorization header via context. 
  // Returning the token from login endpoint is common practice.
  return token;
};

export default generateToken;
