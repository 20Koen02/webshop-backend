import {
  Entity, OneToMany, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import CartProduct from './cart-product.model';
import User from './user.model';

@Entity()
export default class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => CartProduct, (cartProduct) => cartProduct.cart)
  products!: CartProduct[];

  @OneToOne(() => User, (user) => user.cart)
  user!: User;
}
