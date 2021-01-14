import * as express from 'express';
import { Request, Response } from 'express';
import {
  addOrder, addProductsToOrder, deleteOrder, getAllOrders, getOrder,
} from '../crud/order.crud';
import ControllerInterface from '../interfaces/controller.interface';
import authMiddleware from '../middleware/auth.middleware';

class OrderController implements ControllerInterface {
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.use('/orders', authMiddleware);
    this.router.get('/orders/:username', this.getAllOrders);
    this.router.get('/orders/:username/:id', this.getOrder);
    this.router.post('/orders/:username', this.addOrder);
    this.router.delete('/orders/:username/:id', this.deleteOrder);
    this.router.post('/orders/:username/:id/products', this.addProductsToOrder);
  }

  getAllOrders = async (req: Request, res: Response) => {
    if (!req.user.admin && req.user.username !== req.params.username) return res.status(403).json('Not authorized');

    const orders = await getAllOrders(req.params.username);

    if (orders.length === 0) {
      return res.status(404).json('Could not find any orders');
    }
    return res.status(200).json(orders);
  };

  getOrder = async (req: Request, res: Response) => {
    try {
      if (!req.user.admin && req.user.username !== req.params.username) return res.status(403).json('Not authorized');

      const order = await getOrder(req.params.username, req.params.id);

      return res.status(200).json(order);
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  };

  addOrder = async (req: Request, res: Response) => {
    try {
      if (!req.user.admin && req.user.username !== req.params.username) return res.status(403).json('Not authorized');

      await addOrder(req.params.username, req.body);
      return res.json('Successfully added order');
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  };

  deleteOrder = async (req: Request, res: Response) => {
    try {
      if (!req.user.admin && req.user.username !== req.params.username) return res.status(403).json('Not authorized');

      await deleteOrder(req.params.username, req.params.id);
      return res.json('Successfully deleted the order');
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  };

  addProductsToOrder = async (req: Request, res: Response) => {
    try {
      if (!req.user.admin && req.user.username !== req.params.username) return res.status(403).json('Not authorized');
      await addProductsToOrder(req.params.username, req.params.id, req.body);
      return res.json('Successfully added products to order');
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  };
}

export default OrderController;
