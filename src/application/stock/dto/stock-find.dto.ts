import { Store } from "@/src/domain/entities/store.entity";
import { StockType } from "@/src/domain/enums/stock-type.enum";

export type FindStockByIdInputDto = Readonly<{
    id: string,
}>;

export type FindStockByNameInputDto = Readonly<{
    name: string,
}>;

export type FindStockByStoreIdInputDto = Readonly<{
    storeId?: string,
}>;

export type FindStockByTypeInputDto = Readonly<{
    type: StockType,
}>;

export type FindStockFilteredDto = Readonly<{
    name?: string,
    storeId?: string,
    type?: StockType,
}>

export type FindStockOutputDto = Readonly<{
    id: string,
    name: string,
    type: StockType,

    storeId?: string,
    store?: Store,

    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>;