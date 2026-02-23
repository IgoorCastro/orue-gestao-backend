// contrato do repositorio de produto no estoque
import { ItemStock } from "../entities/ItemStock";

// repositorio do Item no estoque
export interface ItemStockRepository {
    save(item: ItemStock): Promise<void>;
    findById(id: string): Promise<ItemStock | null>;
    findByStockId(stockId: string): Promise<ItemStock[]>;
    findByProductId(productId: string): Promise<ItemStock | null>;
    findAll(): Promise<ItemStock[]>;
}