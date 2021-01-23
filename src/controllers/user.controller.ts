import * as express from 'express';
import { Request, Response } from 'express';
import ControllerInterface from '../interfaces/controller.interface';

import {
  createUser, deleteUser, editEmail, editPassword, getAllUsers, getUser,
} from '../crud/user.crud';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import app from '../index';

class UserController implements ControllerInterface {
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get('/users', authMiddleware, this.getAllUsers);
    this.router.get('/users/:username', authMiddleware, this.getUser);
    this.router.post('/users/', optionalAuthMiddleware, this.createUser);
    this.router.delete('/users/:username', authMiddleware, this.deleteUser);
    this.router.put('/users/:username', authMiddleware, this.editUser);
  }

  getAllUsers = async (req: Request, res: Response) => {
    if (!req.user.admin) return res.status(403).json('Not authorized');

    const users = await getAllUsers();
    if (users.length === 0) {
      return res.status(404).json('Could not find users');
    }
    return res.status(200).json(users);
  };

  getUser = async (req: Request, res: Response) => {
    try {
      const user = await getUser(req.params.username);
      if (!req.user.admin && req.user.username !== req.params.username) return res.status(403).json('Not authorized');
      return res.json(user);
    } catch (error) {
      return res.status(404).json(error.toString());
    }
  };

  createUser = async (req: Request, res: Response) => {
    try {
      if (!req.user?.admin) {
        if (req.body.admin) return res.status(400).json('Not authorized to create admin user');
        req.body.admin = false;
        if (!req.body['g-recaptcha-response']) return res.status(400).json('No recaptcha present');
        app.recaptcha.verify(req, async (error) => {
          if (!error) {
            await createUser(req.body);
            return res.json('Successfully created user');
          }
          return res.status(400).json('Invalid Recaptcha');
        });
      } else {
        await createUser(req.body);
        return res.json('Successfully created user');
      }
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      if (!req.user.admin && req.user.username !== req.params.username) return res.status(403).json('Not authorized');
      await deleteUser(req.params.username);
      return res.json('Successfully deleted user');
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  };

  editUser = async (req: Request, res: Response) => {
    try {
      if (!req.user.admin && req.user.username !== req.params.username) return res.status(403).json('Not authorized');
      if (req.body.email) await editEmail(req.params.username, req.body.email);
      if (req.body.password) await editPassword(req.params.username, req.body.password);
      return res.json('Successfully edited user');
    } catch (error) {
      console.log(error);
      return res.status(400).json(error.toString());
    }
  };
}

export default UserController;
