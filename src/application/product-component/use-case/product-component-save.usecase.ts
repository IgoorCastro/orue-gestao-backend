import { ProductComponentRepository } from "@/src/domain/repositories/product-component.repository";
import { UpdateProductComponentInputDto, UpdateProductComponentOutputDto } from "../dto/product-component-save.dto";

export class UpdateProductComponentUseCase {
    constructor(
        private productComponentRepository: ProductComponentRepository,
    ) { }

    async execeute(input: UpdateProductComponentInputDto): Promise<UpdateProductComponentOutputDto> {
        if(!input.id || input.id.length === 0) throw new Error("Id cannot be empty");

        const existingPc = await this.productComponentRepository.findById(input.id);
        if(!existingPc) throw new Error("Product component not found");

        if(input.componentProductId) existingPc.changeComponentProductId(input.componentProductId);
        if(input.parentProductId) existingPc.changeParentProductId(input.parentProductId);
        if(input.quantity) existingPc.changeQuantity(input.quantity);

        return {
            id: existingPc.id,
            componentProductId: existingPc.componentProductId,
            parentProductId: existingPc.parentProductId,
            quantity: existingPc.quantity,
        }
    }
}