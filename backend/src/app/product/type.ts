export interface ProductCategory {
    id: number;
    restaurant_id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
}


export interface Product {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
    restaurant_id: number;
    category_id?: number;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface ProductBranchDetails {
    id: number;
    branch_id: number;
    product_id: number;
    price: number;
    stock: number;
    is_available: boolean;
}