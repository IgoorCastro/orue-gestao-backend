import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { UuidGenerator } from "@/src/domain/services/uuid-generator.services";
import { CreateProductInputDto, CreateProductOutputDto } from "../dto/product-create.dto";
import { Product } from "@/src/domain/entities/product.entity";
import { DefaultSkuGenerator } from "@/src/domain/services/default-sku-generator";
import { ColorRepository } from "@/src/domain/repositories/color.repository";
import { SizeRepository } from "@/src/domain/repositories/size.repository";
import { MaterialRepository } from "@/src/domain/repositories/material.repository";
import { ModelRepository } from "@/src/domain/repositories/model.repository";
import { SkuGeneratorService } from "@/src/domain/services/sku-generator.services";
import { BarcodeGeneratorSerive } from "@/src/domain/services/barcode-generator.services";

export class CreateProductUseCase {
    constructor(
        private productRepository: ProductRepository,
        private colorRepository: ColorRepository,
        private sizeRepository: SizeRepository,
        private materialRepository: MaterialRepository,
        private modelRepository: ModelRepository,
        private uuid: UuidGenerator,
        private sku: SkuGeneratorService,
        private barcode: BarcodeGeneratorSerive,
    ) { }

    async execute(input: CreateProductInputDto): Promise<CreateProductOutputDto> {
        const { name, price, colorId, sizeId, materialId, modelId, mlProductId } = input;
        
        const existingProduct = await this.productRepository.findByName(name);
        if(existingProduct) throw new Error("Product already exists");

        const color = await this.colorRepository.findById(colorId);
        const size = await this.sizeRepository.findById(sizeId);
        const material = await this.materialRepository.findById(materialId);
        const model = await this.modelRepository.findById(modelId);
        if (!model || !material || !color || !size) throw new Error("Invalid product attributes");

        // gerar e testar barcode 
        let bc = ""; // barcode
        let exists = true;
        while(exists) {
            bc = this.barcode.generete();
            exists = await this.productRepository.existsByBarcode(bc); // true para positivo
        }

        const product = new Product({
            id: this.uuid.generate(),
            sku: this.sku.generate({
                name,
                model: model.name,
                material: material.name,
                size: size.size,
                color: color.name,
            }),
            barcode: bc,
            name,
            price,
            colorId,
            sizeId,
            materialId,
            modelId,
            mlProductId,
        });

        await this.productRepository.create(product);

        return {
            id: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            colorId: product.colorId,
            sizeId: product.sizeId,
            materialId: product.materialId,
            modelId: product.modelId,
            barcode: product.barcode,
            mlProductId: product.mlProductId,
        }
    }
}