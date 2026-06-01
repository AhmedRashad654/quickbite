import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { AddressType } from '../enums.js';

export class CreateAddressDTO {
  @IsString()
  @MinLength(1)
  label!: string;

  @IsString()
  @MinLength(1)
  country!: string;

  @IsString()
  @MinLength(1)
  city!: string;

  @IsString()
  @MinLength(1)
  street!: string;

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsString()
  apartment_number?: string;

  @IsEnum(AddressType)
  type!: AddressType;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}

export class UpdateAddressDTO {
  @IsOptional()
  @IsString()
  @MinLength(1)
  label?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  country?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  street?: string;

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsString()
  apartment_number?: string;

  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
