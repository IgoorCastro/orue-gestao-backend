export type UpdateProductMaterialInputDto = Readonly<{
    id: string,
    productId?: string,
    materialId?: string,
}>;

export type UpdateProductMaterialOutputDto = Readonly<{
    id: string,
    productId: string,
    materialId: string,
}>;