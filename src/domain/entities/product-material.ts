// entidade de relação entre produtos e cores

import { Material } from "./material.entity";

type ProductMaterialProps = Readonly<{
    id: string,
    productId: string,
    materialId: string,

    material: Material,
}>

export class ProductMaterial {
    private readonly _id: string;
    private _productId: string;
    private _materialId: string;

    private _material: Material;

    constructor(props: ProductMaterialProps) {
        if (!props.id?.trim()) throw new Error("Id cannot be empty");
        this.validateProductId(props.productId);
        this.validateMaterialId(props.materialId);

        this._id = props.id;
        this._productId = props.productId;
        this._materialId = props.materialId;
        this._material = props.material;
    }

    get id(): string {
        return this._id;
    }

    get productId(): string {
        return this._productId;
    }

    get material(): Material {
        return this._material;
    }

    // talvez nunca seja usado!
    changeProductId(productId: string): void {
        if (productId === this._productId) return;
        this.validateProductId(productId);

        this._productId = productId;
    }

    get materialId(): string {
        return this._materialId;
    }

    changeMaterialId(materialId: string): void {
        if (materialId === this._materialId) return;
        this.validateMaterialId(materialId);

        this._materialId = materialId;
    }

    toJSON() {
        return {
            id: this._id,
            productId: this._productId,
            materialId: this._materialId,
            material: this._material ? this._material.toJSON() : undefined,
        };
    }

    private validateProductId(productId: string): void {
        if (!productId?.trim()) throw new Error("Product Id cannot be empty");
    }

    private validateMaterialId(material: string): void {
        if (!material?.trim()) throw new Error("Material Id cannot be empty");
    }
}