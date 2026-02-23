// contrato para o repositorio do produto
import { Product } from "../entities/Product";

export interface ProductRepository {
    save(material: Product): Promise<void>;
    findById(id: string): Promise<Product | null>;
    findByName(name: string): Promise<Product[]>;
    findBySku(sku: string): Promise<Product[]>;
    findByColor(color: string): Promise<Product[]>;
    findBySize(size: string): Promise<Product[]>;
    findByMaterial(material: string): Promise<Product[]>;
    findByModel(model: string): Promise<Product[]>;
    findAll(): Promise<Product[]>;
}