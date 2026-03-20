export type UpdateProductComponentInputDto = Readonly<{
    id: string,
    parentProductId?: string,
    componentProductId?: string,
    quantity?: number,
}>;

export type UpdateProductComponentOutputDto = Readonly<{
    id: string,
    parentProductId: string,
    componentProductId: string,
    quantity: number,
}>;