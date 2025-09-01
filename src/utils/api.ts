import { Response } from "express";

class APIResponse<T> {
  private constructor(
    private readonly status: number,
    private readonly data?: T,
    private readonly error?: string
  ) {}

  static success<T>(data: T, statusCode = 200): APIResponse<T> {
    return new APIResponse<T>(statusCode, data);
  }

  static error(error: string, statusCode = 500): APIResponse<unknown> {
    return new APIResponse<unknown>(statusCode, undefined, error);
  }

  send(res: Response): void {
    console.log(`Sending response: status=${this.status}, error=${this.error}`);
    res.status(this.status).json({
      data: this.data,
      error: this.error,
    });
  }
}

export default APIResponse;
