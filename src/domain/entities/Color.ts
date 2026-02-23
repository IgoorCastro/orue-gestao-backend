// entidade de cores do produto (amarelo, verde, azul..)
export class Color{ 
    constructor(
        public readonly id: string,
        public color: string,
    ) {
        if(!color || color.trim().length === 0) throw new Error("Color cannot be empty");
    }
}