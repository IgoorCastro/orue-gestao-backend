import { ProductColorRepository } from "@/src/domain/repositories/product-color.repository";

export class FindProductColorByIdUseCase {
    constructor(
        private productColorRepository: ProductColorRepository,
    ) { }

    async execute(id: string) {
        if(!id) throw new Error("Id cannot be empty");
        
        const existingPc = await this.productColorRepository.findById(id);
        if(!existingPc) throw new Error("Product color not found");

        return existingPc;
    }
}