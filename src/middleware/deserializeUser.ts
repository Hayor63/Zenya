import { NextFunction, Request, Response } from "express";
import { verifyjwt } from "../utils/jwt";
import APIResponse from "../utils/api";

const deserialize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = (req.headers.authorization || "").replace(
      /^Bearer\s/,
      ""
    );
    if (!accessToken) return next();

    //verify that the token is valid
    const decodedToken = await verifyjwt(accessToken, "accessTokenPrivateKey");
    res.locals.user = decodedToken;
    next();
  } catch (error) {
    APIResponse.error((error as Error).message, 401).send(res);
  }
};


export default deserialize;