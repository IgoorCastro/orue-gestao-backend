// entidade de tamanho
import { ProductSize } from "../enums/product-size.enum";
import { ValidationError } from "../errors/validation.error";

type SizeProps = Readonly<{
    id: string,
    size: ProductSize,
}>

export class Size {
    private readonly _id: string;
    private _size: ProductSize;

    constructor(props: SizeProps) {
        if (!props.id?.trim()) throw new ValidationError("Id cannot be empty");
        this.validateSize(props.size);

        this._id = props.id;
        this._size = props.size;
    }

    get size(): ProductSize {
        return this._size;
    }

    changeSize(size: ProductSize): void {
        if (size === this._size) return;
        this.validateSize(size);
        this._size = size;
    }

    toJSON() {
        return {
            id: this._id,
            size: this._size,
        };
    }

    private validateSize(size: ProductSize) {
        if (!size || !Object.values(ProductSize).includes(size)) throw new ValidationError("Size is invalid");
    }
}