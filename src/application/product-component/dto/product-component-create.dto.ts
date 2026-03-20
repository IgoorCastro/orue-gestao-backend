export type CreateProductComponentInputDto = Readonly<{
    parentProductId: string,
    componentProductId: string,
    quantity: number,
}>

export type CreateProductComponentOutputDto = Readonly<{
    id: string,
    parentProductId: string,
    componentProductId: string,
    quantity: number,
}>