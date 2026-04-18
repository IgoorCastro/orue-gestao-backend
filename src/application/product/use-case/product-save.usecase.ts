import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { SaveProductInputDto, SaveProductOutputDto } from "../dto/product-save.dto";
import { SkuGeneratorService } from "@/src/domain/services/sku-generator.services";
import { MaterialRepository } from "@/src/domain/repositories/material.repository";
import { ColorRepository } from "@/src/domain/repositories/color.repository";
import { ModelRepository } from "@/src/domain/repositories/model.repository";
import { ValidationError } from "@/src/domain/errors/validation.error";
import { NotFoundError } from "@/src/domain/errors/not-found.error";
import normalizeName from "@/src/domain/utils/normalize-name";
import { ProductType } from "@/src/domain/enums/product-type.enum";

export class UpdateProductUseCase {
    constructor(
        private productRepository: ProductRepository,
        private colorRepository: ColorRepository,
        private materialRepository: MaterialRepository,
        private skuGeneration: SkuGeneratorService,
        private modelRepository: ModelRepository,
    ) { }

    async execute(input: SaveProductInputDto): Promise<SaveProductOutputDto> {
        const { id, name, type, price, size, modelId, materialIds, colorIds, mlProductId } = input;
        let shouldRecalculateSku = false; // controle para gerar novo sku

        if (!id?.trim()) throw new ValidationError("Id cannot be empty");

        const product = await this.productRepository.findById(id);
        if (!product) throw new NotFoundError("Product not found");


        if (name !== undefined) {
            const formattedName = normalizeName(name);
            // const exists = await this.productRepository.findByName(formattedName);
            // console.log("exists", exists)
            // if(exists.length > 0) throw new ConflictError("Product name already exists");
            product.rename(name);
            shouldRecalculateSku = true;
        }


        if (type !== undefined) product.changeType(type);

        if (price !== undefined) product.changePrice(price);

        if (size !== undefined) {
            product.changeSize(size);
            shouldRecalculateSku = true;
        }

        if (mlProductId !== undefined) product.changeMlProductId(mlProductId);

        // altera todo os ids por novos
        if (colorIds?.length) {
            const colors = await this.colorRepository.findByIds(colorIds);
            this.validateIds(colors, colorIds, "Colors");

            product.changeColors(colorIds);
            shouldRecalculateSku = true;
        }

        if (materialIds?.length) {
            // recebe um array de Ids e verifica no Db
            const materials = await this.materialRepository.findByIds(materialIds);
            this.validateIds(materials, materialIds, "Materials");

            product.changeMaterials(materialIds);
            shouldRecalculateSku = true;
        }

        if (modelId?.trim()) {
            product.changeModel(modelId);
            shouldRecalculateSku = true;
        }
        console.log("PASSOUs >> ")

        // alterar sku sempre que houver alteração
        // em suas propriedades
        if (shouldRecalculateSku) {
            console.log("Recalculando SKU");
            if (type === ProductType.PRODUCT) {
                if (!product.modelId) throw new ValidationError("Model id cannot be empty")
                const [colors, materials, model] = await Promise.all([
                    this.colorRepository.findByIds(product.colors),
                    this.materialRepository.findByIds(product.materials),
                    this.modelRepository.findById(product.modelId),
                ]);

                const sku = this.skuGeneration.generate({
                    name: product.name,
                    color: colors.map(c => c.name),
                    material: materials.map(m => m.name),
                    model: model?.name ?? "WWW",
                    size: product.size,
                    type: product.type,
                })

                product.changeSku(sku);
            } else {
                // Recalculo de KIT e PACKAGE
                const sku = this.skuGeneration.generate({
                    name: product.name,
                    size: product.size,
                    type: product.type,
                })
                console.log("Novo SKU: ", sku);

                product.changeSku(sku);
            }
        }

        await this.productRepository.save(product);

        return {
            id: product.id,
            name: product.name,
            size: product.size,
            type: product.type,
            colorIds: product.colors,
            materialIds: product.materials,
            modelId: product.modelId,
            price: product.price,
            sku: product.sku,
            barcode: product.barcode,
            mlProductId: product.mlProductId,
        }
    }

    // valida os ids recebidos com os ids encontrados no db
    private validateIds(found: { id: string }[], inputIds: string[], label: string) {
        const foundIds = found.map(i => i.id);
        const missing = inputIds.filter(id => !foundIds.includes(id));

        // missing > 0 falha
        if (missing.length > 0) throw new NotFoundError(`${label} not found: ${missing.join(", ")}`);
    }
}