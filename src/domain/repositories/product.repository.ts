// contrato para o repositorio do produto
import { Product } from "../entities/product.entity";

export interface ProductRepository {
    create(material: Product): Promise<void>;
    findById(id: string): Promise<Product | null>;
    findByName(name: string): Promise<Product[]>;
    findBySku(sku: string): Promise<Product | null>;
    findByBarcode(barcode: string): Promise<Product | null>;
    findByColor(color: string): Promise<Product[]>;
    findBySize(size: string): Promise<Product[]>;
    findByMaterial(material: string): Promise<Product[]>;
    findByModel(model: string): Promise<Product[]>;
    findAll(): Promise<Product[]>;
    existsByBarcode(barcode: string): Promise<boolean>; // verifica se existe um produto por pesquisa me bc no db
    existsById(id: string): Promise<boolean>; // verifica se existe um produto por pesquisa em id no db
    save(material: Product): Promise<void>;
}