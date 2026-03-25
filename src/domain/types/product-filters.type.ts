import { ProductSize } from "../enums/product-size.enum";

export type ProductFilters = Readonly<{
    colorIds?: string[];
    materialIds?: string[];
    modelId?: string;
    size?: ProductSize;
    page?: number;
    limit?: number;
    orderBy?: {
        field: "name" | "price" | "createdAt";
        direction: "asc" | "desc";
    };
}>;