import { NextFunction, Request, Response } from "express";
import { NotAuthenticated } from "./error.js";
import { verifyAccessToken } from "../../app/auth/utils.js";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
    const token = req.headers.authorization as string; 
    if (!token) {
      throw NotAuthenticated;
    }
    const parts = token.split(' ');
    if (parts.length !== 2) {
        throw NotAuthenticated;
    }
    const accessToken = parts[1];
    req.user = verifyAccessToken(accessToken); 
    return next();
}