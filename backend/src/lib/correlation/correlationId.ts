import type {Request, Response, NextFunction} from "express";
import {v4 as uuidv4} from 'uuid';

export function correlationId(req: Request, res: Response, next: NextFunction) {
    const correlationId = uuidv4();
    req.correlationId = correlationId;
    res.setHeader('X-CorrelationId', correlationId);
    next();
}
