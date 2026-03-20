export type CreateProductColorInputDto = Readonly<{
    productId: string,
    colorId: string,
}>

export type CreateProductColorOutputDto = Readonly<{
    id: string,
    productId: string,
    colorId: string,
}>