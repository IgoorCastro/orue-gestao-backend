// formata o texto de entrada da seguinte forma:
// name = "camiseta dry-fit"
// displayName = "Camiseta Dry-Fit"

import capitalizeFirstLetter from "./capitalize-first-letter";

export default function formatDisplayName(name: string): string {
    return name
        .split(" ")
        .map(word => capitalizeFirstLetter(word))
        .join(" ");
}