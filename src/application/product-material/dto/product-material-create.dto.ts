export type CreateProductMaterialInputDto = Readonly<{
    id: string;
    productId: string,
    materialId: string;
}>;