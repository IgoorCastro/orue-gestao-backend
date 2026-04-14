import { GenerateSkuInput, SkuGeneratorService } from "./sku-generator.services";

export class DefaultSkuGenerator implements SkuGeneratorService {
    generate({ name, model, material, size, color, type }: GenerateSkuInput): string {

        // Nova lógica de formatação de partes
        const formatPart = (value: string) => {
            const trimmed = value.trim();
            
            // Verifica se a string é puramente numérica (ex: "2026")
            if (/^\d+$/.test(trimmed)) {
                // Pega os 3 últimos dígitos (ou menos, se a string for menor)
                return trimmed.slice(-3);
            }
            
            // Se for texto, mantém o padrão dos 3 primeiros dígitos
            return trimmed.substring(0, 3).toUpperCase();
        };

        const splitAndFormat = (value: string) =>
            value
                .split(" ")
                .filter(v => v.length > 0) // Evita espaços duplos
                .map(formatPart)
                .join("/");

        const skuName = splitAndFormat(name);      // CAM/DRY/FIT/026
        const skuModel = formatPart(model);        // CAM

        const skuMaterial = material
            .map(formatPart)
            .join("/");                             // ALG/POL

        const skuColor = color
            .map(formatPart)
            .join("/");                             // PRE

        // Montagem do SKU final
        // Note que usei o formatPart para o 'size' também, caso queira manter a consistência
        const finalSize = size ? size.toUpperCase() : type;

        return `${skuName}-${skuModel}-${skuMaterial}-${skuColor}-${finalSize}`;
    }
}