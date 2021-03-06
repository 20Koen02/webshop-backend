import app from '../index';
import User from '../models/user.model';
import Order from '../models/order.model';
import OrderProduct from '../models/order-product.model';
import Product from '../models/product.model';

async function getUser(username: string) {
  return app.db.getRepository(User)
    .createQueryBuilder('user')
    .where('user.username = :username', { username })
    .getOneOrFail();
}

async function getOrderCount(username: string) {
  const userWithCount = await app.db.getRepository(User)
    .createQueryBuilder('user')
    .loadRelationCountAndMap('user.ordercount', 'user.orders')
    .where('user.username = :username', { username })
    .getOneOrFail();
  return userWithCount.ordercount;
}

export async function getAllOrdersFromAllUsers(): Promise<Order[]> {
  return app.db.getRepository(Order)
    .createQueryBuilder('order')
    .leftJoinAndSelect('order.products', 'orderProduct')
    .leftJoinAndSelect('orderProduct.product', 'product')
    .leftJoinAndSelect('order.user', 'user')
    .getMany();
}

export async function getAllOrders(username: string): Promise<Order[]> {
  const user = await getUser(username);

  return app.db.getRepository(Order)
    .createQueryBuilder('order')
    .where('order.user = :userId', { userId: user.id })
    .leftJoinAndSelect('order.products', 'orderProduct')
    .leftJoinAndSelect('orderProduct.product', 'product')
    .leftJoinAndSelect('order.user', 'user')
    .getMany();
}

export async function getOrder(username: string, orderId: string): Promise<Order> {
  const user = await getUser(username);

  return app.db.getRepository(Order)
    .createQueryBuilder('order')
    .where('order.user = :userId', { userId: user.id })
    .andWhere('order.id = :orderId', { orderId })
    .leftJoinAndSelect('order.products', 'orderProduct')
    .leftJoinAndSelect('orderProduct.product', 'product')
    .getOneOrFail();
}

export async function addOrder(username: string, body: any): Promise<Order> {
  const user = await getUser(username);

  if (await getOrderCount(username) > 25) {
    throw new Error('Your order limit has been reached');
  }

  const order = new Order();
  order.orderDate = new Date();
  order.totalPrice = body.totalPrice;
  await app.db.manager.save(order);

  await app.db.getRepository(User)
    .createQueryBuilder()
    .relation(User, 'orders')
    .of(user)
    .add(order);

  return order;
}

export async function deleteOrder(username: string, orderId: string): Promise<void> {
  const user = await getUser(username);

  const del = await app.db.getRepository(Order)
    .createQueryBuilder()
    .delete()
    .where('user = :userId', { userId: user.id })
    .andWhere('id = :orderId', { orderId })
    .execute();

  if (del.affected === 0) throw new Error('Could not find order for this user');
}

async function getProduct(name: string) {
  return app.db.getRepository(Product)
    .createQueryBuilder('product')
    .where('product.name = :name', { name })
    .getOneOrFail();
}

/* eslint no-await-in-loop: "off" */
export async function setProductsInOrder(username: string, orderId: string, body: any[]) {
  const user = await getUser(username);
  const order = await app.db.getRepository(Order)
    .createQueryBuilder('order')
    .where('order.user = :userId', { userId: user.id })
    .andWhere('order.id = :orderId', { orderId })
    .getOneOrFail();

  const oldOrderProducts = await app.db.getRepository(OrderProduct)
    .createQueryBuilder('orderProduct')
    .where('orderProduct.order = :orderId', { orderId: order.id })
    .getMany();

  await app.db.getRepository(OrderProduct).remove(oldOrderProducts);

  for (const p of body) {
    const orderProduct = new OrderProduct();
    orderProduct.quantity = p.quantity;
    orderProduct.product = await getProduct(p.name);
    await app.db.manager.save(orderProduct);

    await app.db.getRepository(Order)
      .createQueryBuilder()
      .relation(Order, 'products')
      .of(order)
      .add(orderProduct);
  }
}
