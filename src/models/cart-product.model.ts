import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { IsDate, Min } from 'class-validator';
import Product from './product.model';
import Cart from './cart.model';

@Entity()
export default class CartProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Min(0)
  quantity!: number;

  @ManyToOne(() => Product, (product) => product.orders)
  product!: Product;

  @ManyToOne(() => Cart, (cart) => cart.products)
  cart!: Cart;

  @Column()
  @IsDate()
  addedDate!: Date;
}
