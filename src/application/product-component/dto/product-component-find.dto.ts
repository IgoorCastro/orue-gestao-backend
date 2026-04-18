import { Product } from "@/src/domain/entities/product.entity";

export type FindProductComponentByIdInputDto = Readonly<{
    id: string,
}>;

export type FindProductComponentByParentIdInputDto = Readonly<{
    parentId: string,
}>;

export type FindProductComponentByComponentInputDto = Readonly<{
    componentId: string,
}>;

export type FindProductComponentFilteredDto = Readonly<{
    parentId?: string,
    componentId?: string,
}>

export type FindProductComponentOutputDto = Readonly<{
    id: string,
    parentProductId: string,
    componentProductId: string,
    parentProduct?: Product,
    componentProduct?: Product,
    quantity: number,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>;