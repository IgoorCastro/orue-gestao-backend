import { ProductColor } from "@/src/domain/entities/product-color";
import { ProductMaterial } from "@/src/domain/entities/product-material";
import { ProductSize } from "@/src/domain/enums/product-size.enum";
import { ProductType } from "@/src/domain/enums/product-type.enum";

export interface CreateProductInputDto {
    name: string,
    type: ProductType,
    price: number,
    size?: ProductSize,
    modelId?: string,
    materialIds?: string[],
    colorIds?: string[],
    mlProductId?: string,
}

export interface CreateProductOutputDto {
    id: string,
    sku: string,
    name: string,
    normalizedName: string,
    price: number,
    type: ProductType,
    colorIds?: string[],
    size?: ProductSize,
    materialIds?: string[],
    modelId?: string,
    mlProductId?: string,
    barcode?: string,
}