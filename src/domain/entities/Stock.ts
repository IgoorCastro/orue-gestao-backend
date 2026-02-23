// entidade do estoque
import { StockType } from "../enums/StockType.enum";

export class Stock {
    constructor(
        public readonly id: string,
        public isActive: boolean,
        public type: StockType,
        public storeId?: string,
    ) { }

    isMainStock(): boolean {
        return this.type === StockType.MAIN;
    }

    isStockActive(): boolean {
        return this.isActive;
    }
}