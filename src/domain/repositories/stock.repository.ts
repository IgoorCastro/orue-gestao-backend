// contrato para o repositorio do estoque
import { Stock } from "../entities/stock.entity";
import { StockType } from "../enums/stock-type.enum";

export interface StockRepository {
    create(stock: Stock): Promise<void>;
    findById(id: string): Promise<Stock | null>;
    findByName(name: string): Promise<Stock | null>;
    findByType(type: StockType): Promise<Stock[]>;
    findByStoreId(storeId: string): Promise<Stock[]>; // uma loja pode estar vinculada a mais de um estoque
    findAll(): Promise<Stock[]>;
    save(stock: Stock): Promise<void>;
}