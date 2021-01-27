import app from '../index';
import User from '../models/user.model';
import Cart from '../models/cart.model';
import CartProduct from '../models/cart-product.model';
import Product from '../models/product.model';

async function getUser(username: string) {
  return app.db.getRepository(User)
    .createQueryBuilder('user')
    .where('user.username = :username', { username })
    .getOneOrFail();
}

export async function getCart(username: string): Promise<Cart> {
  const user = await getUser(username);

  return app.db.getRepository(Cart)
    .createQueryBuilder('cart')
    .leftJoin('cart.user', user.id)
    .leftJoinAndSelect('cart.products', 'cartproducts')
    .leftJoinAndSelect('cartproducts.product', 'product')
    .getOneOrFail();
}

async function getProduct(name: string) {
  return app.db.getRepository(Product)
    .createQueryBuilder('product')
    .where('product.name = :name', { name })
    .getOneOrFail();
}

/* eslint no-await-in-loop: "off" */
export async function setProductsInCart(username: string, body: any[]) {
  const user = await getUser(username);
  const cart = await app.db.getRepository(Cart)
    .createQueryBuilder('cart')
    .leftJoin('cart.user', user.id)
    .getOneOrFail();

  const oldCartProducts = await app.db.getRepository(CartProduct)
    .createQueryBuilder('cartProduct')
    .where('cartProduct.cart = :cartId', { cartId: cart.id })
    .getMany();

  await app.db.getRepository(CartProduct).remove(oldCartProducts);

  for (const p of body) {
    const cartProduct = new CartProduct();
    cartProduct.quantity = p.quantity;
    cartProduct.product = await getProduct(p.name);
    await app.db.manager.save(cartProduct);

    await app.db.getRepository(Cart)
      .createQueryBuilder()
      .relation(Cart, 'products')
      .of(cart)
      .add(cartProduct);
  }
}
