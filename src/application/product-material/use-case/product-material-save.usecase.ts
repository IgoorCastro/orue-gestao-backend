import { ProductMaterialRepository } from "@/src/domain/repositories/product-material.repository";
import { UpdateProductMaterialInputDto, UpdateProductMaterialOutputDto } from "../dto/product-material-save.dto";
import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { MaterialRepository } from "@/src/domain/repositories/material.repository";

export class UpdateProductMaterialtUseCase {
    constructor(
        private productMaterialRepository: ProductMaterialRepository,
        private productRepository: ProductRepository,
        private materialRepository: MaterialRepository,
    ) { }

    async execeute(input: UpdateProductMaterialInputDto): Promise<UpdateProductMaterialOutputDto> {
        if(!input.id || input.id.length === 0) throw new Error("Id cannot be empty");
        // verificar se o mateiral e o produto existem no db

        const existingPm = await this.productMaterialRepository.findById(input.id);
        if(!existingPm) throw new Error("Product material not found");

        if(input.materialId) {
            const material = await this.materialRepository.existsById(input.materialId);
            if(!material) throw new Error("Material not found");
            existingPm.changeMaterialId(input.materialId);
        }

        if(input.productId) {
            const product = await this.productRepository.existsById(input.productId);
            if(!product) throw new Error("Product not found");
            existingPm.changeProductId(input.productId);
        }

        await this.productMaterialRepository.save(existingPm);

        return {
            id: existingPm.id,
            materialId: existingPm.materialId,
            productId: existingPm.productId,
        }
    }
}