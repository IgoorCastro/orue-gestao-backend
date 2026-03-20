// entidade de composição de produtos
// reponsavel por garantir regras para
// construção de kits e pacotes 

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
        if (!props.id || props.id.trim().length === 0) throw new Error("Id cannot be empty");
        this.validateComponentProductId(props.componentProductId);
        this.validateParentProductId(props.parentProductId);
        this.validateQuantity(props.quantity);
        this.ensureDifferentProducts(props.parentProductId, props.componentProductId);
        if (props.componentProductId === props.parentProductId) throw new Error("Parent and Component Products cannot be equals");

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
        this.validateParentProductId(parentProductId);
        this.ensureDifferentProducts(parentProductId, this._componentProductId);
        // evita troca pelo msm produto
        if (parentProductId === this._parentProductId) return;

        this._parentProductId = parentProductId;
        this.touch();
    }

    get componentProductId(): string {
        return this._componentProductId;
    }

    changeComponentProductId(componentProductId: string): void {
        this.validateComponentProductId(componentProductId);
        this.ensureDifferentProducts(this._parentProductId, componentProductId);
        // evita troca pelo msm produto
        if (componentProductId === this._componentProductId) return;

        this._componentProductId = componentProductId;
        this.touch();
    }

    get quantity(): number {
        return this._quantity;
    }

    changeQuantity(quantity: number): void {
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

    private validateParentProductId(parentProductId: string): void {
        if (!parentProductId || parentProductId.trim().length === 0) throw new Error("Parent Product Id cannot be empty");
    }

    private validateComponentProductId(componentProductId: string): void {
        if (!componentProductId || componentProductId.trim().length === 0) throw new Error("Component Product Id cannot be empty");
    }

    private validateQuantity(quantity: number): void {
        // kit com mais de um produto no minimo
        if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new Error("Invalid quantity");
    }

    // evita que o produto da composição seja igual
    // ao produto pai
    private ensureDifferentProducts(parentId: string, componentId: string): void {
        if (parentId === componentId) {
            throw new Error("Parent and component products cannot be equals");
        }
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}