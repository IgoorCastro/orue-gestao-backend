// gera o SKU padronizado
// exemplo: CAM-DRY-TEC-AZU-M
import { GenerateSkuInput, SkuGeneratorService } from "./sku-generator.services";


export class DefaultSkuGenerator implements SkuGeneratorService {
    generate({ name, model, material, size, color }: GenerateSkuInput): string {
        const part = (value: string) =>
            value.substring(0, 3).toUpperCase();

        const skuColor = color.map(part).join("+");
        const skuMaterial = material.map(part).join("+");

        return `${part(name)}-${part(model)}-${skuMaterial}-${skuColor}-${size.toUpperCase()}`;
    }
}