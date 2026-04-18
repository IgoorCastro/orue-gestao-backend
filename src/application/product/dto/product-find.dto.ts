import { ProductColor } from "@/src/domain/entities/product-color";
import { ProductMaterial } from "@/src/domain/entities/product-material";
import { ProductSize } from "@/src/domain/enums/product-size.enum";
import { ProductType } from "@/src/domain/enums/product-type.enum";

export type FindProductByIdInputDto = Readonly<{
    id: string;
}>

export type FindProductByNameInputDto = Readonly<{
    name: string;
}>

export type FindProductBySkuInputDto = Readonly<{
    sku: string;
}>

export type FindProductFilteredDto = Readonly<{
    name?: string,
    size?: ProductSize;
    type?: ProductType,
    barcode?: string,
    mlProductId?: string,
    maxPrice?: number,
    minPrice?: number,

    colorIds?: string[];
    materialIds?: string[];
    modelIds?: string[];
    page?: number;
    limit?: number;
    orderBy?: {
        field: "name" | "price" | "createdAt";
        direction: "asc" | "desc";
    };
}>

export type FindProductOutputDto = Readonly<{
    id: string,
    sku: string,
    name: string,
    price: number,
    size?: ProductSize,
    type: ProductType,
    barcode?: string,

    modelId?: string,
    materialIds?: string[],
    mlProductId?: string,
    colorIds?: string[],

    productColor?: ProductColor[],
    productMaterial?: ProductMaterial[],

    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

export type FindProductListOutputDto = Readonly<{
    data: FindProductOutputDto[];
    total: number;
    page: number;
    limit: number;
}>