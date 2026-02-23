import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Unhandled error:', err);

  if (err.message?.includes('Nieobsługiwany format')) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.message?.includes('File too large')) {
    res.status(413).json({ error: 'Plik jest za duży. Maksymalny rozmiar: 2GB' });
    return;
  }

  res.status(500).json({ error: 'Wystąpił wewnętrzny błąd serwera' });
}
