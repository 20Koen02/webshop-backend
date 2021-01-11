import * as express from 'express';
import { Request, Response } from 'express';
import ControllerInterface from '../interfaces/controller.interface';
import {
  createProduct, getAllProducts, getProduct, deleteProduct,
} from '../crud/product.crud';
import authMiddleware from '../middleware/auth.middleware';

class ProductController implements ControllerInterface {
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get('/products', this.getAllProducts);
    this.router.get('/products/:name', this.getProduct);
    this.router.post('/products/', authMiddleware, this.createProduct);
    this.router.delete('/products/:name', authMiddleware, this.deleteProduct);
  }

  getAllProducts = async (req: Request, res: Response) => {
    const products = await getAllProducts();
    if (products.length === 0) {
      return res.status(404).json('Could not find products');
    }
    return res.status(200).json(products);
  };

  getProduct = async (req: Request, res: Response) => {
    try {
      const product = await getProduct(req.params.name);
      return res.json(product);
    } catch (error) {
      return res.status(404).json(error.toString());
    }
  };

  createProduct = async (req: Request, res: Response) => {
    try {
      if (!req.user.admin) return res.status(403).json('Not authorized');
      await createProduct(req.body);
      return res.json('Successfully created product');
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    try {
      if (!req.user.admin) return res.status(403).json('Not authorized');
      await deleteProduct(req.params.name);
      return res.json('Successfully deleted product');
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  };
}

export default ProductController;
