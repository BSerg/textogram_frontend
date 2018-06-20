import * as Jwt from 'jsonwebtoken';
import {Request} from 'express';
import * as fs from 'fs';

export function verifyJWT(token: any): any|null {
    try {
        return  Jwt.verify(token, fs.readFileSync(process.env.PUBLIC_KEY_PATH || ''), {ignoreExpiration: true});
    }
    catch (error) {
        console.log(error)
        return null;
    }
}

export function getUserFromRequest(req: Request): any|null {
    let payload: any = verifyJWT(req.cookies.jwt);
    try {
        return payload.sub
    }
    catch (error) {
        console.log(error);
        return null
    }
}