import {
  Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { IsDate, Min } from 'class-validator';
import User from './user.model';
import OrderProduct from './order-product.model';

@Entity()
export default class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.orders)
  user!: string;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  products!: OrderProduct[];

  @Column()
  @IsDate()
  orderDate!: Date;

  @Column('float')
  @Min(0)
  totalPrice!: number;
}
