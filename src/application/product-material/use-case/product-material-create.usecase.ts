// cria relação entre produto e cor
// Pp = ParentProduct; Cp = ComponentProduct; pc = ProductComponent

import { ProductComponentRepository } from "@/src/domain/repositories/product-component.repository";
import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { ProductComponent } from "@/src/domain/entities/product-component";
import { UuidGenerator } from "@/src/domain/services/uuid-generator.services";

// Package -> composição de um ou mais kits (Kit)
export class CreateProductComponentUseCase {
    constructor(
        private productComponentRepository: ProductComponentRepository,
        private productRepository: ProductRepository,
        private uuid: UuidGenerator,
    ) { }

    async execute({ componentProductId, parentProductId, quantity }: CreateProductComponentInputDto): Promise<CreateProductComponentOutputDto> {
        if (parentProductId === componentProductId) throw new Error("Product cannot be a component of itself");
        if (quantity < 1) throw new Error("Quantity must be greater than zero");

        // teste de existencia do produto
        const parentProduct = await this.productRepository.existsById(parentProductId);
        if (!parentProduct) throw new Error("Parent product not found");

        const componentProduct = await this.productRepository.existsById(componentProductId);
        if (!componentProduct) throw new Error("Component product not found");

        const pc = new ProductComponent({
            id: this.uuid.generate(),
            componentProductId: componentProductId,
            parentProductId: parentProductId,
            quantity: quantity,
        });

        await this.productComponentRepository.create(pc);

        return {
            id: pc.id,
            componentProductId: pc.componentProductId,
            parentProductId: pc.parentProductId,
            quantity: pc.quantity,
        }
    }
}