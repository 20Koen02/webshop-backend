import * as express from 'express';
import { Request, Response } from 'express';
import {
  getCart, setProductsInCart,
} from '../crud/cart.crud';
import ControllerInterface from '../interfaces/controller.interface';
import { authMiddleware } from '../middleware/auth.middleware';

class CartController implements ControllerInterface {
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.use('/carts', authMiddleware);
    this.router.get('/carts/:username', this.getCart);
    this.router.post('/carts/:username/products', this.setProductsInCart);
  }

  getCart = async (req: Request, res: Response) => {
    if (!req.user.admin && req.user.username !== req.params.username) return res.status(403).json('Not authorized');

    const cart = await getCart(req.params.username);

    return res.status(200).json(cart);
  };

  setProductsInCart = async (req: Request, res: Response) => {
    try {
      if (!req.user.admin && req.user.username !== req.params.username) return res.status(403).json('Not authorized');
      await setProductsInCart(req.params.username, req.body);
      return res.json('Successfully set products in cart');
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  };
}

export default CartController;
