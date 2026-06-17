import {IsInt, IsPositive, IsString, MinLength, MaxLength, IsOptional} from "class-validator";

export class CreatePayoutRequestDTO {
    @IsInt()
    @IsPositive()
    restaurant_id!: number;

    @IsInt()
    @IsPositive()
    amount!: number; // minor units

    @IsString()
    @MinLength(2)
    @MaxLength(8)
    currency!: string;

    @IsString()
    @MinLength(1)
    @MaxLength(128)
    provider_reference_id!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    note?: string;
}
