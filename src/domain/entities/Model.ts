// entidade do modelo do produto (calça, bermuda, camiseta..)
export class Model {
    constructor(
        public readonly id: string,
        public model: string,
    ) {
        if (!model || model.trim().length === 0) throw new Error("Model cannot be empty");
    }
}