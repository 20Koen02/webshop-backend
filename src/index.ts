import cors from 'cors';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import Server from './server';
import loggerMiddleware from './middleware/logger.middleware';
import UserController from './controllers/user.controller';
import 'reflect-metadata';
import User from './models/user.model';
import AuthController from './controllers/auth.controller';
import ProductController from './controllers/product.controller';
import OrderController from './controllers/order.controller';

declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }
}

const app = new Server({
  port: 5500,
  controllers: [
    new UserController(),
    new AuthController(),
    new ProductController(),
    new OrderController(),
  ],
  middleWares: [
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    loggerMiddleware,
    cors(),
    helmet(),
    compression(),
  ],
});

app.listen();

export default app;
