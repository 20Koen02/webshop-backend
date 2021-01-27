import { Request, Response } from 'express';
import chalk from 'chalk';
import strftime from 'strftime';

const getRequestDuration = (start: any) => {
  const diff = process.hrtime(start);
  return (diff[0] * 1e9 + diff[1]) / 1e6;
};

const loggerMiddleware = (req: Request, res: Response, next: any) => {
  const date = new Date();
  const start = process.hrtime();
  const durationInMilliseconds = getRequestDuration(start);
  console.log(`[${chalk.yellow(process.pid)}] [${chalk.green(req.ip)}] [${chalk.blue(strftime('%Y-%m-%d %H:%M:%S', date))}] ${chalk.cyan(req.method)}: ${req.url} ${chalk.red(`${durationInMilliseconds.toLocaleString()}ms`)}`);
  next();
};

export default loggerMiddleware;
