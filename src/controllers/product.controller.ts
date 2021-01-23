import * as express from 'express';
import { Request, Response } from 'express';
import ControllerInterface from '../interfaces/controller.interface';
import {
  createProduct, getAllProducts, getProduct, deleteProduct, editProduct,
} from '../crud/product.crud';
import { authMiddleware } from '../middleware/auth.middleware';

class ProductController implements ControllerInterface {
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get('/products', this.getAllProducts);
    this.router.get('/products/:id', this.getProduct);
    this.router.post('/products/', authMiddleware, this.createProduct);
    this.router.delete('/products/:id', authMiddleware, this.deleteProduct);
    this.router.put('/products/:id', authMiddleware, this.updateProduct);
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
      const product = await getProduct(req.params.id);
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
      await deleteProduct(req.params.id);
      return res.json('Successfully deleted product');
    } catch (error) {
      return res.status(400).json(error.toString());
    }
  };

  updateProduct = async (req: Request, res: Response) => {
    try {
      if (!req.user.admin) return res.status(403).json('Not authorized');

      if (req.body.name) await editProduct(req.params.id, req.body.name, 'name');
      if (req.body.description) await editProduct(req.params.id, req.body.description, 'description');
      if (req.body.price) await editProduct(req.params.id, req.body.price, 'price');
      if (req.body.image) await editProduct(req.params.id, req.body.image, 'image');

      return res.json('Successfully edited product');
    } catch (error) {
      console.log(error);
      return res.status(400).json(error.toString());
    }
  };
}

export default ProductController;
