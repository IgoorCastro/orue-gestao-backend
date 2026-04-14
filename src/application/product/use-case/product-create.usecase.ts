import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { UuidGeneratorServices } from "@/src/domain/services/uuid-generator.services";
import { CreateProductInputDto, CreateProductOutputDto } from "../dto/product-create.dto";
import { Product } from "@/src/domain/entities/product.entity";
import { ColorRepository } from "@/src/domain/repositories/color.repository";
import { MaterialRepository } from "@/src/domain/repositories/material.repository";
import { ModelRepository } from "@/src/domain/repositories/model.repository";
import { SkuGeneratorService } from "@/src/domain/services/sku-generator.services";
import { BarcodeGeneratorService } from "@/src/domain/services/barcode-generator.services";
import normalizeName from "@/src/domain/utils/normalize-name";
import { NotFoundError } from "@/src/domain/errors/not-found.error";

export class CreateProductUseCase {
    constructor(
        private productRepository: ProductRepository,
        private colorRepository: ColorRepository,
        private materialRepository: MaterialRepository,
        private modelRepository: ModelRepository,
        private uuid: UuidGeneratorServices,
        private sku: SkuGeneratorService,
        private barcode: BarcodeGeneratorService,
    ) { }

    async execute(input: CreateProductInputDto): Promise<CreateProductOutputDto> {
        const { name, type, price, size, modelId, materialIds, colorIds, mlProductId } = input;
        
        const formattedName = normalizeName(name);

        const [ model, materials, colors] = await Promise.all([
            this.modelRepository.findById(modelId),
            this.materialRepository.findByIds(materialIds),
            this.colorRepository.findByIds(colorIds),
        ])

        // valida o produto pelo nome
        // if (existingProduct) throw new ConflictError("Product already exists");

        // validação do modelo
        if (!model) throw new NotFoundError("Model not found");

        // size sera validado na entidade (ts ja garante o tipo no ENUM)
        // validação dos materiais
        this.validateIds(materials, materialIds, "Materials");

        // validação das cores
        this.validateIds(colors, colorIds, "Colors");

        // gerar e testar barcode 
        let bc = ""; // barcode
        let exists = true;
        // roda até gerar um bc disponivel
        while (exists) {
            bc = await this.barcode.generate();
            exists = await this.productRepository.existsByBarcode(bc); // true para positivo
        }
        
        const product = Product.create({
            id: this.uuid.generate(),
            name: name,
            price: price,
            type: type,
            
            sku: this.sku.generate({
                name: formattedName,
                model: model.name,
                material: materials.map(m => m.name),
                size: size,
                color: colors.map(c => c.name),
                type: type,
            }),
            barcode: bc,
            size: size,
            modelId: modelId,
            mlProductId: mlProductId,
        });

        // adiciona os ids dos materiais na entidade
        materialIds.forEach(materialId => product.addMaterial({ materialId }));

        // adiciona os ids das cores na entidade
        colorIds.forEach(colorId => product.addColor({ colorId }));

        await this.productRepository.create(product);

        return {
            id: product.id,
            sku: product.sku,
            name: product.name,
            normalizedName: product.normalizedName,
            price: product.price,
            colorIds: product.colors,
            size: product.size ?? undefined,
            materialIds: product.materials,
            modelId: product.modelId,
            barcode: product.barcode,
            mlProductId: product.mlProductId,
        }
    }

    // valida os ids recebidos com os ids encontrados no db
    private validateIds(found: { id: string }[], inputIds: string[], label: string) {
        const foundIds = found.map(i => i.id);
        const missing = inputIds.filter(id => !foundIds.includes(id));

        if (missing.length > 0) throw new NotFoundError(`${label} not found: ${missing.join(", ")}`);
    }
}