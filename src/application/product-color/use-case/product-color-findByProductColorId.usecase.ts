import { ProductColorRepository } from "@/src/domain/repositories/product-color.repository";

export class FindByProductColorIdUseCase {
    constructor(
        private productColorRepository: ProductColorRepository,
    ) { }

    async execute(productId: string, colorId: string) {
        if(!productId || !colorId) throw new Error("Id cannot be empty");
        
        const existingPc = await this.productColorRepository.findByProductAndColorId(colorId, productId);
        if(!existingPc) throw new Error("Product color not found");

        return existingPc;
    }
}