// contrato para o repositorio do estoque
import { Stock } from "../entities/Stock";
import { StockType } from "../enums/StockType.enum";

export interface StockRepository {
    save(material: Stock): Promise<void>;
    findById(id: string): Promise<Stock | null>;
    findByType(type: StockType): Promise<Stock[]>;
    findAll(): Promise<Stock[]>;
}