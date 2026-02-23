// entidade de tamanho
import { ItemSize } from "../enums/ItemSize.enum";

export class Size {
    constructor(
        public readonly id: string,
        public size: ItemSize,
    ){
        if(!size || size.trim().length === 0) throw new Error("Size cannot be empty");
    }
}