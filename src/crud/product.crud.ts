import { validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import app from '../index';
import Product from '../models/product.model';

export async function getAllProducts(): Promise<Product[]> {
  return app.db.getRepository(Product)
    .createQueryBuilder('product')
    .select(['product.name', 'product.description', 'product.price', 'product.image'])
    .getMany();
}

export async function getProduct(name: string): Promise<Product> {
  return app.db.getRepository(Product)
    .createQueryBuilder('product')
    .select(['product.name', 'product.description', 'product.price', 'product.image'])
    .where('product.name = :name', { name })
    .getOneOrFail();
}

export async function createProduct(body: any): Promise<void> {
  const newBody = body;
  if (newBody.id) delete newBody.id;
  if (newBody.orders) delete newBody.orders;
  const product = plainToClass(Product, body);
  await validateOrReject(product);
  await app.db.getRepository(Product).save(product);
}

export async function deleteProduct(name: string): Promise<void> {
  const product = await app.db.getRepository(Product)
    .createQueryBuilder('product')
    .where('product.name = :name', { name })
    .getOne();
  if (!product) throw new Error('Could not find product');
  await app.db.getRepository(Product).remove(product);
}
