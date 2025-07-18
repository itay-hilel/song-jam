// src/ports/http/middleware.ts
import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url}`);
    next();
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
}

export function notFound(req: Request, res: Response) {
    res.status(404).send('Not Found');
}