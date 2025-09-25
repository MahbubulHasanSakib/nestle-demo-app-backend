import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDate,
  IsArray,
  ValidateNested,
  IsDefined,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ImageKind } from '../interface/image-kind.type';
import { DeliveryMethod } from '../interface/delivery-method.type';
import { PaymentMethod } from '../interface/payment-method.type';

class OutletDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  channel: string;

  @IsString()
  route: string;

  @IsOptional()
  @IsString()
  routecode?: string;

  @IsString()
  outletcode: string;

  @IsOptional()
  @IsString()
  contactNo?: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;
}

class TownDto {
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  towncode: string;

  @IsNotEmpty()
  region: string;

  @IsNotEmpty()
  area: string;

  @IsNotEmpty()
  territory: string;
}

export class ImageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  original: string;

  @IsString()
  @IsNotEmpty()
  thumb: string;

  @IsNotEmpty()
  @IsOptional()
  kind: string;
}

export class SkuItem {
  @IsString()
  name: string;

  @IsNumber()
  detectedQty: number;
}

class OrderItemDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  qty: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  totalPrice: number;

  @IsNumber()
  size: number;
}

class ExchangeOROrderItem {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsDate()
  @IsOptional()
  expireDate: Date;

  @IsNumber()
  qty: number;

  @IsNumber()
  price: number;
}
export class CreateExecutionDto {
  @ApiProperty({
    example: {
      id: '64f9b3e7d2b3a91234abcd02',
      name: 'Super Store',
      channel: 'Retail',
      route: 'Route-12',
      routecode: 'RC12',
      outletcode: 'OUT1002',
      contactNo: '017XXXXXXXX',
      lat: 23.8103,
      lon: 90.4125,
    },
  })
  @ValidateNested()
  @Type(() => OutletDto)
  outlet: OutletDto;

  @ApiProperty({
    example: {
      id: '60a57c7c89ca736bf8522131',
      name: 'Sample Town',
      towncode: 'TOWN12345',
      region: 'Sample Region',
      area: 'Sample Area',
      territory: 'Sample Territory',
    },
  })
  @Type(() => TownDto)
  @ValidateNested()
  @IsDefined()
  town: TownDto;

  @ApiProperty({ example: '2025-09-23T08:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  executionStartAt: Date;

  @ApiProperty({ example: '2025-09-23T08:30:00.000Z' })
  @IsDate()
  @Type(() => Date)
  executionEndAt: Date;

  @ApiProperty({ example: '00:02:33' })
  @IsString()
  duration: string;

  @ApiProperty({
    example: [
      {
        name: 'execution_photo1.jpg',
        original: 'https://cdn.example.com/images/original1.jpg',
        thumb: 'https://cdn.example.com/images/thumb1.jpg',
        kind: 'Inside',
      },
      {
        name: 'execution_photo2.jpg',
        original: 'https://cdn.example.com/images/original2.jpg',
        thumb: 'https://cdn.example.com/images/thumb2.jpg',
        kind: 'Outside',
      },
    ],
  })
  @Type(() => ImageDto)
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  image: ImageDto[];

  @ApiProperty({
    example: [
      {
        name: 'Meril Vitamin C Soap Bar - Tangerine Orange',
        detectedQty: 43,
      },
      {
        name: 'Meril Baby Soap',
        detectedQty: 37,
      },
      {
        name: 'Meril Milk Soap Bar',
        detectedQty: 32,
      },
      {
        name: 'Meril Vitamin C Soap Bar - Lemon & Lime',
        detectedQty: 48,
      },
      {
        name: 'Meril Milk & Rose Soap Bar',
        detectedQty: 23,
      },
      {
        name: 'Meril Milk & Beli Soap Bar',
        detectedQty: 41,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkuItem)
  detectedItems?: SkuItem[];

  @ApiProperty({
    example: [
      {
        id: '68d3eed4afae12a98fb18e2a',
        name: 'Meril Vitamin C Soap Bar – Tangerine Orange 100gm',
        qty: 5,
        unitPrice: 60,
        totalPrice: 300,
        size: 100,
      },
      {
        id: '68d3eed4afae12a98fb18e2d',
        name: 'Meril Vitamin C Soap Bar – Lemon & Lime 150gm',
        qty: 5,
        unitPrice: 80,
        totalPrice: 400,
        size: 150,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @ApiProperty({
    example: [
      {
        id: '68d3eed4afae12a98fb18e2a',
        name: 'Meril Vitamin C Soap Bar – Tangerine Orange 100gm',
        expireDate: '2025-09-23T12:00:00.000Z',
        qty: 5,
        price: 60,
      },
      {
        id: '68d3eed4afae12a98fb18e2d',
        name: 'Meril Vitamin C Soap Bar – Lemon & Lime 150gm',
        expireDate: '2025-09-23T12:00:00.000Z',
        qty: 5,
        price: 60,
      },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExchangeOROrderItem)
  exchangeItems: ExchangeOROrderItem[];

  @ApiProperty({
    example: [
      {
        id: '68d3eed4afae12a98fb18e2a',
        name: 'Meril Vitamin C Soap Bar – Tangerine Orange 100gm',
        expireDate: '2025-09-23T12:00:00.000Z',
        qty: 5,
        price: 60,
      },
      {
        id: '68d3eed4afae12a98fb18e2d',
        name: 'Meril Vitamin C Soap Bar – Lemon & Lime 150gm',
        expireDate: '2025-09-23T12:00:00.000Z',
        qty: 5,
        price: 60,
      },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExchangeOROrderItem)
  returnItems: ExchangeOROrderItem[];

  @ApiProperty({ example: 250 })
  @IsNumber()
  totalOrderedAmount: number;

  @ApiProperty({
    enum: DeliveryMethod,
    required: false,
    example: DeliveryMethod.INSTANT,
  })
  @IsOptional()
  @IsEnum(DeliveryMethod)
  deliveryType?: DeliveryMethod;

  @ApiProperty({ example: '2025-09-23T12:00:00.000Z', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deliveryDate?: Date;

  @ApiProperty({
    enum: PaymentMethod,
    required: false,
    example: PaymentMethod.CASH,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: 'remarks for exchange', required: false })
  @IsOptional()
  @IsString()
  remarksForExchange?: string;

  @ApiProperty({ example: 'remarks for return', required: false })
  @IsOptional()
  @IsString()
  remarksForReturn?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  withinRadius?: boolean;

  @ApiProperty({ example: 23.8103, required: false })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({ example: 90.4125, required: false })
  @IsOptional()
  @IsNumber()
  lon?: number;

  @ApiProperty({ example: 120, required: false })
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deletedAt?: Date;
}
