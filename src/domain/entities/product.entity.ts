// entidade do produto
// barcode podera sera adicionado
// em um segundo momento

import { ProductType } from "../enums/product-type.enum";
import capitalizeFirstLetter from "../utils/capitalize-first-letter";
import normalizeName from "../utils/normalize-name";
import { ProductColor } from "./product-color";
import { ProductMaterial } from "./product-material";
import { ProductSize } from "../enums/product-size.enum";
import { ValidationError } from "../errors/validation.error";

type ProductProps = Readonly<{
    id: string,
    sku: string,
    name: string,
    price: number,
    size: ProductSize,
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
    private _name: string;
    private _type: ProductType;
    private _price: number;
    private _size: ProductSize;
    private _modelId: string;
    private _materialIds: string[];
    private _colorIds: string[];
    private _mlProductId?: string; // vínculo futuro com ML
    private _sku: string;
    private _barcode?: string;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(props: ProductProps) {
        if (!props.id?.trim()) throw new ValidationError("Id cannot be empty");
        this.validateSize(props.size);
        this.validateModel(props.modelId);
        Product.validateName(props.name);
        this.validatePrice(props.price);
        this.validateSku(props.sku);
        this.validateType(props.type);
        if (props.barcode !== undefined) this.validateBarCode(props.barcode);

        this._id = props.id;
        this._name = props.name;
        this._price = props.price;
        this._type = props.type;
        this._sku = props.sku;
        this._barcode = props.barcode;
        this._size = props.size;
        this._modelId = props.modelId;
        this._materialIds = [];
        this._colorIds = [];
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
        size: ProductSize,
        modelId: string,
        mlProductId?: string,
        barcode?: string,
    }): Product {
        const now = new Date();

        return new Product({
            id: props.id,
            name: Product.formatName(props.name),
            price: props.price,
            type: props.type,
            sku: props.sku,
            barcode: props.barcode,
            size: props.size,
            modelId: props.modelId,
            mlProductId: props.mlProductId,
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        });
    }

    static restore(props: ProductProps & { colors: string[], materials: string[] }): Product {
        const product = new Product(props);

        product._colorIds = props.colors;
        product._materialIds = props.materials;

        return product;
    }

    get id(): string {
        return this._id;
    }

    get sku(): string {
        return this._sku;
    }

    changeSku(sku: string): void {
        this.ensureNotDeleted();
        if (sku === this._sku) return;
        this.validateSku(sku);

        this._sku = sku;
        this.touch();
    }

    get name(): string {
        return this._name;
    }

    rename(name: string): void {
        this.ensureNotDeleted();
        const formattedName = Product.formatName(name);
        if (formattedName === this._name) return;

        this._name = formattedName;
        this.touch();
    }

    get price(): number {
        return this._price;
    }

    changePrice(price: number): void {
        this.ensureNotDeleted();
        if (price === this.price) return;
        this.validatePrice(price);

        this._price = price;
        this.touch();
    }

    get type(): ProductType {
        return this._type;
    }


    changeType(type: ProductType): void {
        this.ensureNotDeleted();
        if (type === this.type) return;
        this.validateType(type);

        this._type = type;
        this.touch();
    }

    get size(): ProductSize {
        return this._size;
    }

    changeSize(size: ProductSize): void {
        this.ensureNotDeleted();
        if (size === this.size) return;
        this.validateSize(size);

        this._size = size;
        this.touch();
    }

    get modelId(): string {
        return this._modelId;
    }

    changeModel(modelId: string): void {
        this.ensureNotDeleted();
        if (modelId === this.modelId) return;
        this.validateModel(modelId);

        this._modelId = modelId;
        this.touch();
    }

    get mlProductId(): string | undefined {
        return this._mlProductId;
    }

    changeMlProductId(mlProductId: string) {
        this.ensureNotDeleted();
        if (mlProductId === this.mlProductId) return;
        this.validateMlProductId(mlProductId);

        this._mlProductId = mlProductId;
        this.touch();
    }

    get barcode(): string | undefined {
        return this._barcode;
    }

    changeBarcode(barcode?: string): void {
        this.ensureNotDeleted();
        if (barcode === this._barcode) return;

        // adicionar um novo barcode
        if (barcode !== undefined) this.validateBarCode(barcode);

        // remove o barcode atual 'barcode undefined'
        this._barcode = barcode;
        this.touch();
    }

    get colors(): string[] {
        return [...this._colorIds];
    }

    addColor(input: { colorId: string }): void {
        this.ensureNotDeleted();
        if (!input.colorId?.trim()) throw new ValidationError("Color id cannot be empty");
        // evita duplicidade
        if (this._colorIds.some(id => id === input.colorId)) throw new ValidationError("Color already exists");

        this._colorIds.push(input.colorId)
        this.touch();
    }

    changeColors(colorIds: string[]): void {
        this.ensureNotDeleted();

        if (!colorIds || colorIds.length === 0) throw new ValidationError("Product must have at least one color");

        const uniqueIds = [...new Set(colorIds)];

        // valida se algum id é inválido (string vazia, etc)
        if (uniqueIds.some(id => !id?.trim())) {
            throw new ValidationError("Invalid color id");
        }

        this._colorIds = uniqueIds;
        this.touch();
    }

    removeColor(colorId: string): void {
        this.ensureNotDeleted();
        // salva o tamanho inicial
        const initialLength = this._colorIds.length;

        // reecria o array evitando a props 'colorId'
        this._colorIds = this._colorIds.filter(id => id !== colorId);

        // se tiver alteração no tamanho inicial, touch!
        if (this._colorIds.length !== initialLength) this.touch();
    }

    get materials(): string[] {
        return [...this._materialIds];
    }

    addMaterial(input: { materialId: string }): void {
        this.ensureNotDeleted();
        if (!input.materialId?.trim()) throw new ValidationError("Material id cannot be empty");
        // evita duplicidade
        if (this._materialIds.some(id => id === input.materialId)) throw new ValidationError("Material already exists");

        this._materialIds.push(input.materialId);

        this.touch();
    }

    changeMaterials(materialIds: string[]): void {
        this.ensureNotDeleted();

        if (!materialIds) {
            this._materialIds = [];
            this.touch();
            return;
        };

        const uniqueIds = [...new Set(materialIds)];

        // valida se algum id é inválido (string vazia, etc)
        if (uniqueIds.some(id => !id?.trim())) {
            throw new ValidationError("Invalid color id");
        }

        this._materialIds = uniqueIds;
        this.touch();
    }

    removeMaterial(materialId: string): void {
        this.ensureNotDeleted();
        // salva o tamanho inicial
        const initialLength = this._materialIds.length;

        this._materialIds = this._materialIds.filter(id => id !== materialId);

        // se tiver alteração no tamanho inicial, touch!
        if (this._materialIds.length !== initialLength) this.touch();
    }

    get createdAt(): Date {
        return new Date(this._createdAt);
    }

    get updatedAt(): Date {
        return new Date(this._updatedAt);
    }

    get deletedAt(): Date | undefined {
        return this._deletedAt ? new Date(this._deletedAt) : undefined;
    }

    delete(): void {
        this.ensureNotDeleted();

        this._deletedAt = new Date();
        this.touch();
    }

    restoreDeleted(): void {
        if (!this._deletedAt) return;

        this._deletedAt = undefined;
        this.touch();
    }

    isActive(): boolean {
        return !this._deletedAt;
    }

    private validatePrice(price: number): void {
        // valor deve ser maior que 0!
        if (price <= 0 || !Number.isFinite(price)) throw new ValidationError("Invalid price");
    }

    private static validateName(name: string): void {
        if (!name?.trim()) throw new ValidationError("Name cannot be empty");
    }

    private validateSku(sku: string): void {
        if (!sku?.trim()) throw new ValidationError("Sku cannot be empty");
    }

    private validateSize(size: ProductSize): void {
        if (!Object.values(ProductSize).includes(size)) throw new ValidationError("Product size is invalid");
    }

    private validateModel(model: string): void {
        if (!model?.trim()) throw new ValidationError("Model cannot be empty");
    }

    private validateMlProductId(mlProductId: string): void {
        if (!mlProductId?.trim()) throw new ValidationError("ID Mercado Livre is invalid");
    }

    private validateBarCode(barcode: string): void {
        if (!barcode?.trim()) throw new ValidationError("Barcode cannot be empty");
    }

    private validateType(type: ProductType): void {
        if (!Object.values(ProductType).includes(type)) throw new ValidationError("Product type is invalid");
    }

    private static formatName(name: string): string {
        const normalized = normalizeName(name);
        Product.validateName(normalized);

        return normalized;
    }

    private ensureNotDeleted(): void {
        if (!this.isActive) throw new ValidationError("Product is deleted");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}