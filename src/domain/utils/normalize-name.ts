/**
 * Normalizador para nomes.
 * Utilizar antes do capitalize-first-letter
 * Utilidade: Evitar duplicados.
 *
 * Exemplo:
 * "CAMISETA" → "camiseta", " Camiseta" → "camiseta"
 */

export default function normalizeName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .normalize("NFD") // separa acentos
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/[^a-z0-9\s]/g, "") // remove caracteres especiais
        .replace(/\s+/g, " "); // remove espaços duplicados
}