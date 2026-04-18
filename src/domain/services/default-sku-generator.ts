import { GenerateSkuInput, SkuGeneratorService } from "./sku-generator.services";

export class DefaultSkuGenerator implements SkuGeneratorService {
    generate({ name, model, material, size, color, type }: GenerateSkuInput): string {

        const formatPart = (value: string | undefined): string => {
            if (!value) return "";
            
            const trimmed = value.trim();
            if (trimmed.length === 0) return "";

            // Se for numérico (ex: "2026"), pega os 3 últimos
            if (/^\d+$/.test(trimmed)) {
                return trimmed.slice(-3);
            }
            
            return trimmed.substring(0, 3).toUpperCase();
        };

        const splitAndFormat = (value: string | undefined): string => {
            if (!value) return "";
            return value
                .split(" ")
                .filter(v => v.length > 0)
                .map(formatPart)
                .filter(v => v !== "") // Remove partes que ficaram vazias
                .join("/");
        };

        // 1. Nome formatado (sempre existe)
        const skuName = splitAndFormat(name);

        // 2. Modelo (opcional)
        const skuModel = formatPart(model);

        // 3. Materiais (opcional - Array)
        const skuMaterial = (material ?? [])
            .map(formatPart)
            .filter(v => v !== "")
            .join("/");

        // 4. Cores (opcional - Array)
        const skuColor = (color ?? [])
            .map(formatPart)
            .filter(v => v !== "")
            .join("/");

        // 5. Tamanho ou Tipo
        const finalSize = (size || type || "").toUpperCase();

        // Montagem inteligente:
        // Criamos um array com todas as partes, filtramos o que for vazio 
        // e juntamos com o hífen.
        return [skuName, skuModel, skuMaterial, skuColor, finalSize]
            .filter(part => part !== "") // Remove os "buracos" se a prop for undefined
            .join("-");
    }
}