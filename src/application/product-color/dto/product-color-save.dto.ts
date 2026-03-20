export type SaveProductColorInputDto = Readonly<{
    id: string,
    productId?: string,
    colorId?: string,
}>

export type SaveProductColorOutputDto = Readonly<{
    id: string,
    productId: string,
    colorId: string,
}>