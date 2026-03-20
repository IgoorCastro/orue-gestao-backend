// entidade de tamanho
import { ItemSize } from "../enums/product-size.enum";

type SizeProps = Readonly<{
    id: string,
    size: ItemSize,
}>

export class Size {
    private readonly _id: string;
    private _size: ItemSize;

    constructor(props: SizeProps) {
        if(!props.id || props.id.trim().length === 0) throw new Error("Id cannot be empty");
        this.validateSize(props.size);

        this._id = props.id;
        this._size = props.size;
    }

    get size(): ItemSize {
        return this._size;
    }

    changeSize(size: ItemSize): void {
        this.validateSize(size);
        this._size = size;
    }

    private validateSize(size: ItemSize) {
        if (!size || !Object.values(ItemSize).includes(size)) throw new Error("Size is invalid");
    }
}