// entidade de composição de produtos
// reponsavel por garantir regras para
// construção de kits e pacotes 

import { ValidationError } from "../errors/validation.error";

type ProductComponentProps = Readonly<{
    id: string,
    parentProductId: string,
    componentProductId: string,
    quantity: number,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>
export class ProductComponent {
    private readonly _id: string;
    private _parentProductId: string;
    private _componentProductId: string;
    private _quantity: number;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(props: ProductComponentProps) {
        if (!props.id?.trim()) throw new ValidationError("Id cannot be empty");
        this.validateComponentProductId(props.componentProductId);
        this.validateParentProductId(props.parentProductId);
        this.ensureNotSameProduct(props.parentProductId, props.componentProductId);
        this.validateQuantity(props.quantity);

        this._id = props.id;
        this._parentProductId = props.parentProductId;
        this._componentProductId = props.componentProductId;
        this._quantity = props.quantity;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    // util para criar novos registros
    static create(props: { id: string, parentProductId: string, componentProductId: string, quantity: number }): ProductComponent {
        const now = new Date();

        return new ProductComponent({
            id: props.id,
            parentProductId: props.parentProductId,
            componentProductId: props.componentProductId,
            quantity: props.quantity,
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        });
    }

    // util para criar atualizar registros
    static restore(props: ProductComponentProps): ProductComponent {
        return new ProductComponent(props);
    }

    get id(): string {
        return this._id;
    }

    get parentProductId(): string {
        return this._parentProductId;
    }

    changeParentProductId(parentProductId: string): void {
        this.ensureNotDeleted();
        this.validateParentProductId(parentProductId);
        this.ensureNotSameProduct(parentProductId, this._componentProductId);
        // evita troca pelo msm produto
        if (parentProductId === this._parentProductId) return;

        this._parentProductId = parentProductId;
        this.touch();
    }

    get componentProductId(): string {
        return this._componentProductId;
    }

    changeComponentProductId(componentProductId: string): void {
        this.ensureNotDeleted();
        this.validateComponentProductId(componentProductId);
        this.ensureNotSameProduct(this._parentProductId, componentProductId);
        // evita troca pelo msm produto
        if (componentProductId === this._componentProductId) return;

        this._componentProductId = componentProductId;
        this.touch();
    }

    get quantity(): number {
        return this._quantity;
    }

    changeQuantity(quantity: number): void {
        this.ensureNotDeleted();
        if (quantity === this._quantity) return;

        this.validateQuantity(quantity);
        this._quantity = quantity;
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

    delete(): void {
        this.ensureNotDeleted();

        this._deletedAt = new Date();
        this.touch();
    }

    restoreDeleted(): void {
        if (this.isActive()) return;

        this._deletedAt = undefined;
        this.touch();
    }

    isActive(): boolean {
        return !this._deletedAt;
    }

    toJSON() {
        return {
            id: this._id,
            parentProductId: this._parentProductId,
            componentProductId: this._componentProductId,
            quantity: this._quantity,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
            deletedAt: this._deletedAt,
        };
    }

    private validateParentProductId(parentProductId: string): void {
        if (!parentProductId?.trim()) throw new ValidationError("Parent Product Id cannot be empty");
    }

    private validateComponentProductId(componentProductId: string): void {
        if (!componentProductId?.trim()) throw new ValidationError("Component Product Id cannot be empty");
    }

    private validateQuantity(quantity: number): void {
        // kit com um ou mais produtos no minimo
        if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new ValidationError("Invalid quantity");
    }

    // evita que o produto da composição seja igual
    // ao produto pai
    private ensureNotSameProduct(parentId: string, componentId: string): void {
        if (parentId === componentId) {
            throw new ValidationError("Parent and component products cannot be equals");
        }
    }

    private ensureNotDeleted(): void {
        if (!this.isActive) throw new ValidationError("Product component is deleted");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}