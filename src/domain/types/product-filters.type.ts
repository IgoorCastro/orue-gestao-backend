import { ProductSize } from "../enums/product-size.enum";
import { ProductType } from "../enums/product-type.enum";

export type ProductFilters = Readonly<{
    name?: string,
    colorIds?: string[];
    materialIds?: string[];
    modelIds?: string[];
    size?: ProductSize;
    type?: ProductType,
    barcode?: string,
    mlProductId?: string,
    maxPrice?: number,
    minPrice?: number,
    
    page?: number;
    limit?: number;
    orderBy?: {
        field: "name" | "price" | "createdAt";
        direction: "asc" | "desc";
    };
}>;