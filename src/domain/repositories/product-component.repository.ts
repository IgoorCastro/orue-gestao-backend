import { ProductComponent } from "../entities/product-component";

export interface ProductComponentRepository {
    create(item: ProductComponent): Promise<void>;
    findAll(): Promise<ProductComponent[]>;
    findById(id: string): Promise<ProductComponent | null>;
    findByParentProductId(parentProductId: string): Promise<ProductComponent[]>;
    findByComponentProductId(componentProductId: string): Promise<ProductComponent[]>;
    // contrato para trabalhar com produto pai e filhos
    findByParentAndComponentProductId(parentId: string, componentId: string): Promise<ProductComponent | null>;
    exists(parentId: string, componentId: string, ignoreId?: string): Promise<boolean>
    save(item: ProductComponent): Promise<void>;
}