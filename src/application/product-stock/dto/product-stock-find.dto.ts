type Product = Readonly<{
    id: string;
    name: string;
    price: number;
    sku: string,
    barcode?: string,
    type: string,
    size: string,
}>

type Store = Readonly<{
    id: string,
    name: string,
}>

type Stock = Readonly<{
    id: string,
    name: string,
    type: string,
    store?: Store,
}>

export type FindProductStockByIdInputDto = Readonly<{
    id: string,
}>;

export type FindProductStockByProductIdInputDto = Readonly<{
    productId: string,
}>;

export type FindProductStockByStockIdInputDto = Readonly<{
    stockId: string,
}>;

export type FindProductStockByProductAndStockIdInputDto = Readonly<{
    stockId: string,
    productId: string,
}>;

export type FindProductStockFilteredDto = Readonly<{
    stockId?: string,
    productId?: string,
}>


export type FindProductStockOutputDto = Readonly<{
    id: string,
    stockId: string,
    productId: string,
    quantity: number,

    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,

    product?: Product,
    stock?: Stock,
}>;