import {
  Column, Entity, Index, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import {
  IsBoolean, IsEmail, IsString, Length,
} from 'class-validator';
import Order from './order.model';
import Cart from './cart.model';

@Entity()
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index({ unique: true })
  @IsString()
  @Length(2, 20)
  username!: string;

  @Column()
  @IsString()
  password!: string;

  @Column()
  @IsBoolean()
  admin!: boolean;

  @Column()
  @Index({ unique: true })
  @IsEmail()
  email!: string;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @OneToOne(() => Cart)
  @JoinColumn()
  cart!: Cart;
}
