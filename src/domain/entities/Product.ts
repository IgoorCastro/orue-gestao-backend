// entidade do produto
export class Product {
    constructor(
        public readonly id: string,
        public name: string,
        public sku: string,
        private price: number,
        public color_id: string,
        public size_id: string,
        public material_id: string,
        public model_id: string,
        public mlProductId?: string, // vínculo futuro com ML
    ) {
        this.validatePrice(price);
        this.validateName(name);
        this.validateSku(sku);
    }

    private validatePrice(price: number): void {
        if(price < 0 || !Number.isFinite(price)) throw new Error("Price cannot be negative");
    }

    private validateName(name: string): void {
        if(!name || name.trim().length === 0) throw new Error("Name cannot be empty");
    }

    private validateSku(sku: string): void {
        if(!sku || sku.trim().length === 0) throw new Error("Sku cannot be empty");
    }

    getPrice(): number {
        return this.price;
    }

    setPrice(price: number): void {
        this.validatePrice(price);
        this.price = price;
    }
}