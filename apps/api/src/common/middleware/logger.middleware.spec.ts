import { LoggerMiddleware } from './logger.middleware';
import { Request, Response } from 'express';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;

  beforeEach(() => {
    middleware = new LoggerMiddleware();
  });

  it('should call next()', () => {
    const req = {
      method: 'GET',
      originalUrl: '/customers',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('jest-agent'),
    } as unknown as Request;

    const res = {
      on: jest.fn(),
      statusCode: 200,
    } as unknown as Response;

    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should log on response finish', () => {
    let finishCallback: () => void;

    const req = {
      method: 'DELETE',
      originalUrl: '/customers/1',
      ip: '192.168.1.1',
      get: jest.fn().mockReturnValue('supertest'),
    } as unknown as Request;

    const res = {
      on: jest.fn().mockImplementation((_event: string, cb: () => void) => {
        finishCallback = cb;
      }),
      statusCode: 204,
    } as unknown as Response;

    const logSpy = jest.spyOn(middleware['logger'], 'log').mockImplementation(() => {});
    middleware.use(req, res, jest.fn());

    finishCallback!();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('DELETE /customers/1 204'),
    );
  });
});
