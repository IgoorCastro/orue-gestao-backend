// cria uma composição de produtos
// do tipo: Product ou Kit
// composições disponiveis: 
// Kit -> composição de um ou mais produtos (Product)
// Package -> composição de um ou mais kits (Kit)
// Pp = ParentProduct; Cp = ComponentProduct; pc = ProductComponent

import { ProductComponentRepository } from "@/src/domain/repositories/product-component.repository";
import { CreateProductComponentInputDto, CreateProductComponentOutputDto } from "../dto/product-component-create.dto";
import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { ProductComponent } from "@/src/domain/entities/product-component";
import { UuidGeneratorServices } from "@/src/domain/services/uuid-generator.services";
import { ProductType } from "@/src/domain/enums/product-type.enum";
import { ValidationError } from "@/src/domain/errors/validation.error";
import { ConflictError } from "@/src/domain/errors/conflict.error";
import { NotFoundError } from "@/src/domain/errors/not-found.error";

export class CreateProductComponentUseCase {
    constructor(
        private productComponentRepository: ProductComponentRepository,
        private productRepository: ProductRepository,
        private uuid: UuidGeneratorServices,
    ) { }

    async execute({ componentProductId, parentProductId, quantity }: CreateProductComponentInputDto): Promise<CreateProductComponentOutputDto> {
        console.log("componentProductId: ", componentProductId)
        console.log("parentProductId: ", parentProductId)
        console.log("quantity: ", quantity)
        if(componentProductId === undefined || parentProductId === undefined) throw new ValidationError("Product and component id is required");
        if (parentProductId === componentProductId) throw new ValidationError("Product cannot be a component of itself");
        if (quantity < 1) throw new ValidationError("Quantity must be greater than zero");

        const [parentProduct, componentProduct] = await Promise.all([
            this.productRepository.findById(parentProductId),
            this.productRepository.findById(componentProductId),
        ]);
        
        // teste produto existente
        if (!parentProduct) throw new NotFoundError("Parent product not found"); // produto nao encontrado
        if (parentProduct.type === ProductType.PRODUCT) throw new ValidationError("Product cannot have components"); // produto tipo produto não pode gerar composição

        if (!componentProduct) throw new NotFoundError("Component product not found"); // produto nao encontrado
        if (componentProduct.type === ProductType.PACKAGE) throw new ValidationError("Package cannot be a component"); // pacote nao pode ser composição
        
        if (parentProduct.type === ProductType.PACKAGE && componentProduct.type !== ProductType.KIT) { // composição de pacote só pode ter KIT
            throw new ValidationError("Package can only contain kits");
        }
        if(parentProduct.type === ProductType.KIT && componentProduct.type !== ProductType.PRODUCT) throw new ValidationError("Kit can only contain products");

        // evita duplicidade
        const exists = await this.productComponentRepository.exists(parentProductId, componentProductId);
        if (exists) throw new ConflictError("Component already exists in this product");

        const pc = ProductComponent.create({
            id: this.uuid.generate(),
            componentProductId: componentProductId,
            parentProductId: parentProductId,
            quantity: quantity,
        })

        await this.productComponentRepository.create(pc);

        return {
            id: pc.id,
            componentProductId: pc.componentProductId,
            parentProductId: pc.parentProductId,
            quantity: pc.quantity,
        }
    }
}