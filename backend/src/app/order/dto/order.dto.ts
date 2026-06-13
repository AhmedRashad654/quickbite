import { ArrayMinSize, IsEnum, IsInt, Max, Min, ValidateNested } from "class-validator";
import { PaymentMethod } from "../enums.js";
import { Type } from "class-transformer";

export class OrderItemDTO {
    @IsInt()
    @Min(1)
    productId!: number;

    @IsInt()
    @Min(1)
    @Max(50)
    quantity!: number;
}

export class CreateOrderDTO {
    @IsInt()
    @Min(1)
    branchId!: number;

    @IsInt()
    @Min(1)
    customerAddressId!: number;

    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod;

    @ArrayMinSize(1)
    @ValidateNested({each: true})
    @Type(() => OrderItemDTO)
    items!: OrderItemDTO[];
}