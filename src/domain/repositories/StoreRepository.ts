// contrato para o repositorio da loja
import { Store } from "../entities/Store";

export interface StoreRepository {
    save(material: Store): Promise<void>;
    findById(id: string): Promise<Store | null>;
    findByName(name: string): Promise<Store[]>;
    findAll(): Promise<Store[]>;
}