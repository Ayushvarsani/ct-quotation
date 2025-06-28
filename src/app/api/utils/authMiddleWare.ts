import jwt from "jsonwebtoken";

export const generateToken = (userUuid: string): string => {
  console.log(userUuid);
  const payload = {
    userUuid,
  };

  return jwt.sign(payload, process.env.JWT_TOKEN_KEY as string);
};
