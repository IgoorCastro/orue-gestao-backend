// material do produto (100% algodão / 80% algodão, 20% poliester)
export class Material {
    constructor(
        public readonly id: string,
        public material: string,
    ) {
        if(!material || material.trim().length === 0) throw new Error("Material cannot be empty");
    }
}