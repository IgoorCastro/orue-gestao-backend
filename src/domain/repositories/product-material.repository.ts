import { ProductMaterial } from "../entities/product-material";

// contrato repositorio do Produto x Cor
export interface ProductMaterialRepository {
    create(item: ProductMaterial): Promise<void>;
    findById(id: string): Promise<ProductMaterial | null>;
    findByProductAndMaterialId(materialId: string, productId: string): Promise<ProductMaterial| null>;
    findByProductId(productId: string): Promise<ProductMaterial | null>;
    findByMaterialId(material: string): Promise<ProductMaterial[]>;
    findAll(): Promise<ProductMaterial[]>;
    save(item: ProductMaterial): Promise<void>;
}