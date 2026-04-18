import { ProductSize } from "@/src/domain/enums/product-size.enum"
import { ProductType } from "@/src/domain/enums/product-type.enum"

export type SaveProductInputDto = {
    id: string,
    name?: string,
    type?: ProductType,
    price?: number,
    size?: ProductSize,
    modelId?: string,
    materialIds?: string[],
    colorIds?: string[],
    mlProductId?: string,
}

export type SaveProductOutputDto = {
    id: string,
    name: string,
    type: ProductType,
    price: number,
    size?: ProductSize,
    modelId?: string,
    materialIds: string[],
    colorIds?: string[],
    mlProductId?: string,
    barcode?: string,
    sku: string,
}