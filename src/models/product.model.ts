import {
  Column, Entity, Index, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import {
  IsNumber, IsString, IsUrl, Length, Min,
} from 'class-validator';
import OrderProduct from './order-product.model';

@Entity()
export default class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index({ unique: true })
  @IsString()
  @Length(2, 20)
  name!: string;

  @Column()
  @IsString()
  description!: string;

  @Column('float')
  @IsNumber()
  @Min(0)
  price!: number;

  @Column()
  @IsUrl()
  image!: string;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.product)
  orders!: Product[];
}
