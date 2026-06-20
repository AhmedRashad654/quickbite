import { Response } from 'express';
import { PaginationMeta } from './pagination/cursor-pagination.js';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Object;
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200, meta?: Object) {
  const body: ApiResponse<T> = { success: true, data: data };
  if (message) body.message = message;
  if (meta) body.meta = meta;
  res.status(statusCode).json(body);
}

export function sendPaginated<T>(res: Response, data: T, meta: PaginationMeta) {
  res.status(200).json({ success: true, data: data, meta });
}
