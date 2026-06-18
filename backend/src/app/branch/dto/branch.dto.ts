import { IsString, IsNotEmpty, IsNumber, IsInt, Min, IsEnum, Max, IsOptional, IsBoolean } from 'class-validator';
import { Country, Currency } from '../enums.js';

export class CreateBranchDTO {
  @IsString()
  @IsEnum(Country)
  country_code!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  address_text!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @IsString()
  opens_at!: string;

  @IsString()
  closes_at!: string;

  @IsInt()
  @Min(0)
  delivery_radius!: number;

  @IsEnum(Currency)
  currency!: Currency;
}

export class UpdateBranchDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  label?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address_text?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  opens_at?: string;

  @IsOptional()
  @IsString()
  closes_at?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  delivery_radius?: number;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsBoolean()
  accept_orders?: boolean;
}

export class UpdateBranchStatusDTO {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission?: number;
}
