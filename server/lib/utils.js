import jwt from "jsonwebtoken"

//function to generate a token from a user

// No async because jwt.sign() is synchronous
// { userId } because JWT payload must be an object of claims

export const generateToken = (userId) =>{ 
  const token = jwt.sign({userId}, process.env.JWT_SECRET)  
  return token;
}