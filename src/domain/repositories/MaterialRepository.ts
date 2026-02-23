// contrato do repositorio do material do produto
import { Material } from "../entities/Material";

export interface MaterialRepository {
    save(material: Material): Promise<void>;
    findById(id: string): Promise<Material | null>;
    findByMaterial(material: string): Promise<Material[]>;
    findAll(): Promise<Material[]>;
}