// entidade do produto
// barcode podera sera adicionado
// em um segundo momento

import { ProductType } from "../enums/product-type.enum";
import capitalizeFirstLetter from "../utils/capitalize-first-letter";

type ProductProps = Readonly<{
    id: string,
    sku: string,
    name: string,
    price: number,
    sizeId: string,
    modelId: string,
    mlProductId?: string,
    barcode?: string,
    type: ProductType,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

export class Product {
    private readonly _id: string;
    private _sku: string;
    private _name: string;
    private _type: ProductType;
    private _price: number;
    private _sizeId: string;
    private _modelId: string;
    private _mlProductId?: string; // vínculo futuro com ML
    private _barcode?: string;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(props: ProductProps) {
        if (!props.id || props.id.trim().length === 0) throw new Error("Id cannot be empty");
        this.validateSize(props.sizeId);
        this.validateModel(props.modelId);
        this.validateName(props.name);
        this.validatePrice(props.price);
        this.validateSku(props.sku);
        this.validateType(props.type);
        if(props.barcode !== undefined) this.validateBarCode(props.barcode);

        this._id = props.id;
        this._name = capitalizeFirstLetter(props.name);
        this._price = props.price;
        this._type = props.type;
        this._sku = props.sku;
        this._barcode = props.barcode;
        this._sizeId = props.sizeId;
        this._modelId = props.modelId;
        this._mlProductId = props.mlProductId;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    static create(props: {
        id: string,
        name: string,
        price: number,
        type: ProductType,
        sku: string,
        barcode?: string,
        sizeId: string,
        modelId: string,
        mlProductId?: string,
    }): Product {
        const now = new Date();

        return new Product({
            id: props.id,
            name: props.name,
            price: props.price,
            type: props.type,
            sku: props.sku,
            barcode: props.barcode,
            sizeId: props.sizeId,
            modelId: props.modelId,
            mlProductId: props.mlProductId,
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        });
    }

    static restore(props: ProductProps): Product {
        return new Product(props);
    }

    get id(): string {
        return this._id;
    }

    get sku(): string {
        return this._sku;
    }

    changeSku(sku: string): void {
        if (sku === this._sku) return;
        this.validateSku(sku);

        this._sku = sku;
        this.touch();
    }

    get name(): string {
        return this._name;
    }

    rename(name: string): void {
        if (name === this._name) return;
        this.validateName(name);

        this._name = capitalizeFirstLetter(name);
        this.touch();
    }

    get price(): number {
        return this._price;
    }

    changePrice(price: number): void {
        if (price === this.price) return;
        this.validatePrice(price);

        this._price = price;
        this.touch();
    }

    get type(): ProductType {
        return this._type;
    }


    changeType(type: ProductType): void {
        if (type === this.type) return;
        this.validateType(type);

        this._type = type;
        this.touch();
    }

    get sizeId(): string {
        return this._sizeId;
    }

    changeSize(sizeId: string): void {
        if (sizeId === this.sizeId) return;
        this.validateSize(sizeId);

        this._sizeId = sizeId;
        this.touch();
    }

    get modelId(): string {
        return this._modelId;
    }

    changeModel(modelId: string): void {
        if (modelId === this.modelId) return;
        this.validateModel(modelId);

        this._modelId = modelId;
        this.touch();
    }

    get mlProductId(): string | undefined {
        return this._mlProductId;
    }

    changeMlProductId(mlProductId: string) {
        if (mlProductId === this.mlProductId) return;
        this.validateMlProductId(mlProductId);

        this._mlProductId = mlProductId;
        this.touch();
    }

    get barcode(): string | undefined {
        return this._barcode;
    }

    changeBarcode(barcode?: string): void {
        if (barcode === this._barcode) return;

        // adicionar um novo barcode
        if (barcode !== undefined) this.validateBarCode(barcode);

        // remove o barcode atual 'barcode undefined'
        this._barcode = barcode;
        this.touch();
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    get deletedAt(): Date | undefined {
        return this._deletedAt;
    }

    private validatePrice(price: number): void {
        if (price < 0 || !Number.isFinite(price)) throw new Error("Invalid price");
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) throw new Error("Name cannot be empty");
    }

    private validateSku(sku: string): void {
        if (!sku || sku.trim().length === 0) throw new Error("Sku cannot be empty");
    }

    private validateSize(size: string): void {
        if (!size || size.trim().length === 0) throw new Error("Size cannot be empty");
    }

    private validateModel(model: string): void {
        if (!model || model.trim().length === 0) throw new Error("Model cannot be empty");
    }

    private validateMlProductId(mlProductId: string): void {
        if (!mlProductId || mlProductId.trim().length === 0) throw new Error("ID Mercado Livre is invalid");
    }

    private validateBarCode(barcode: string): void {
        if (!barcode || barcode.trim().length === 0) throw new Error("Barcode cannot be empty");
    }

    private validateType(type: ProductType): void {
        if (!Object.values(ProductType).includes(type)) throw new Error("Product type is invalid");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}