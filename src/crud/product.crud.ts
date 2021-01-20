import { validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import app from '../index';
import Product from '../models/product.model';

export async function getAllProducts(): Promise<Product[]> {
  return app.db.getRepository(Product)
    .createQueryBuilder('product')
    .select(['product.id', 'product.name', 'product.description', 'product.price', 'product.image', 'product.deleted'])
    .getMany();
}

export async function getProduct(id: string): Promise<Product> {
  return app.db.getRepository(Product)
    .createQueryBuilder('product')
    .select(['product.id', 'product.name', 'product.description', 'product.price', 'product.image', 'product.deleted'])
    .where('product.id = :id', { id })
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

export async function deleteProduct(id: string): Promise<void> {
  const product = await app.db.getRepository(Product)
    .createQueryBuilder('product')
    .where('product.id = :id', { id })
    .getOne();
  if (!product) throw new Error('Could not find product');
  product.deleted = true;
  await app.db.getRepository(Product)
    .update({ id }, product);
}

export async function editProduct(id: string, val: string, prop: string): Promise<void> {
  const product = await app.db.getRepository(Product)
    .createQueryBuilder('product')
    .where('product.id = :id', { id })
    .andWhere('product.deleted = :del', { del: false })
    .getOne();
  if (!product) throw new Error('Could not find product');
  // @ts-ignore
  product[prop] = val;
  await app.db.getRepository(Product)
    .update({ id }, product);
}
