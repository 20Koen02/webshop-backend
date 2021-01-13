import * as express from 'express';
import { Request, Response } from 'express';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import ControllerInterface from '../interfaces/controller.interface';

import {
  createUser,
  getLoginUser, getUser,
} from '../crud/user.crud';
import { expiresIn, secret } from '../config';
import JwtPayloadInterface from '../interfaces/jwt-payload.interface';
import authMiddleware from '../middleware/auth.middleware';

class AuthController implements ControllerInterface {
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get('/auth/me', authMiddleware, this.getMe);
    this.router.post('/auth/login', this.login);
    this.router.post('/auth/register', this.register);
  }

  getMe = async (req: Request, res: Response) => res.status(200).json(req.user);

  // eslint-disable-next-line consistent-return
  login = async (req: Request, res: Response) => {
    try {
      const userBody = req.body;
      if (typeof userBody.username !== 'string'
        || typeof userBody.password !== 'string') return res.status(400).json('Please specify a username and password');
      const userInDB = await getLoginUser(userBody.username);
      if (!await argon2.verify(userInDB.password, userBody.password)) return res.status(403).json('Incorrect username or password');

      const payload: JwtPayloadInterface = {
        userId: userInDB.id,
      };

      jwt.sign(
        payload,
        secret,
        {
          expiresIn,
        } as SignOptions,
        async (err, token) => {
          if (err) throw err;
          const user = await getUser(userBody.username);
          res.status(200).json({
            expiresIn,
            token,
            user,
          });
        },
      );
    } catch (error) {
      console.log(error);
      return res.status(403).json('Incorrect username or password');
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      if (!req.user.admin) return res.status(403).json('Not authorized');
      await createUser(req.body);
      return res.json('Successfully created user');
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  };
}

export default AuthController;
