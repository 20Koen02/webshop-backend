import {
  Column, Entity, Index, IsNull, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import {
  IsBoolean, IsNumber, IsOptional, IsString, IsUrl, Min,
} from 'class-validator';
import OrderProduct from './order-product.model';

@Entity()
export default class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index({ unique: true })
  @IsString()
  name!: string;

  @Column()
  @IsString()
  description!: string;

  @Column({
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  deleted!: boolean;

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
