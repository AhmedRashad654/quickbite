import {IsString, IsNotEmpty, IsOptional, IsInt, Min, IsBoolean} from "class-validator";

export class CreateProductDTO {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image_url?: string;

    @IsOptional()
    @IsString()
    category_name?: string;
}

export class UpdateProductDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image_url?: string;

    @IsOptional()
    @IsString()
    category_name?: string;

    // branch-level overrides (requires branchId query param)
    @IsOptional()
    @IsInt()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @IsOptional()
    @IsBoolean()
    is_available?: boolean;
}
