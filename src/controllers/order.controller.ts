import * as express from 'express';
import { Request, Response } from 'express';
import {
  addOrder, deleteOrder, getAllOrders, getAllOrdersFromAllUsers, getOrder, setProductsInOrder,
} from '../crud/order.crud';
import ControllerInterface from '../interfaces/controller.interface';
import { authMiddleware } from '../middleware/auth.middleware';

class OrderController implements ControllerInterface {
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.use('/orders', authMiddleware);
    this.router.get('/orders', this.getAllOrdersFromAllUsers);
    this.router.get('/orders/:username', this.getAllOrders);
    this.router.get('/orders/:username/:id', this.getOrder);
    this.router.post('/orders/:username', this.addOrder);
    this.router.delete('/orders/:username/:id', this.deleteOrder);
    this.router.post('/orders/:username/:id/products', this.setProductsInOrder);
  }

  getAllOrdersFromAllUsers = async (req: Request, res: Response) => {
    if (!req.user.admin) return res.status(403).json('Not authorized');

    const orders = await getAllOrdersFromAllUsers();

    if (orders.length === 0) {
      return res.status(404).json('Could not find any orders');
    }
    return res.status(200).json(orders);
  };

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

      const order = await addOrder(req.params.username, req.body);
      return res.json(order.id);
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

  setProductsInOrder = async (req: Request, res: Response) => {
    try {
      if (!req.user.admin && req.user.username !== req.params.username) return res.status(403).json('Not authorized');
      await setProductsInOrder(req.params.username, req.params.id, req.body);
      return res.json('Successfully set products in order');
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  };
}

export default OrderController;
