// entidade de relação entre produtos e cores

type ProductMaterialProps = Readonly<{
    id: string,
    productId: string, 
    materialId: string,
}>

export class ProductMaterial {
    private readonly _id: string;
    private _productId: string;
    private _materialId: string;

    constructor(props: ProductMaterialProps) {
        if(!props.id || props.id.trim().length === 0) throw new Error("Id cannot be empty");
        this.validateProductId(props.productId);
        this.validateMaterialId(props.materialId);

        this._id = props.id;
        this._productId = props.productId;
        this._materialId = props.materialId;
    }

    get id(): string {
        return this._id;
    }

    get productId(): string {
        return this._productId;
    }

    changeProductId(productId: string): void {
        this.validateProductId(productId);
        this._productId = productId;
    }

    get materialId(): string {
        return this._materialId;
    }

    changeMaterialId(materialId: string): void {
        this.validateMaterialId(materialId);
        this._materialId = materialId;
    }

    private validateProductId(productId: string): void {
        if(!productId || productId.trim().length === 0) throw new Error("Product Id cannot be empty");
    }

    private validateMaterialId(material: string): void {
        if(!material || material.trim().length === 0) throw new Error("Material Id cannot be empty");
    }
}