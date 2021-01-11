import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import CartProduct from './cart-product.model';

@Entity()
export default class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => CartProduct, (cartProduct) => cartProduct.cart)
  products!: CartProduct[];
}
