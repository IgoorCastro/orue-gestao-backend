import { Product } from "@/src/domain/entities/product.entity";
import { ProductRepository } from "@/src/domain/repositories/product.repository";

export class PrismaProductRepository implements ProductRepository {
    async create(material: Product): Promise<void> {
        
    }

    existsByBarcode(barcode: string): Promise<boolean> {
        
    }

    findAll(): Promise<Product[]> {
        
    }

    findByBarcode(barcode: string): Promise<Product | null> {
        
    }

    findByColor(color: string): Promise<Product[]> {
        
    }

    findById(id: string): Promise<Product | null> {
        
    }

    findByMaterial(material: string): Promise<Product[]> {
        
    }

    findByModel(model: string): Promise<Product[]> {
        
    }

    findByName(name: string): Promise<Product[]> {
        
    }

    findBySize(size: string): Promise<Product[]> {
        
    }

    findBySku(sku: string): Promise<Product | null> {
        
    }

    save(material: Product): Promise<void> {
        
    }
}