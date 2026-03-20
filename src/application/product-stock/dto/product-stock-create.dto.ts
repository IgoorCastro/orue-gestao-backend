export type CreateProductStockInputDto = {
    stockId: string,
    productId: string,
    quantity: number,
}

export type CreateProductStockOutuputDto = {
    id: string,
    stockId: string,
    productId: string,
    quantity: number,
}