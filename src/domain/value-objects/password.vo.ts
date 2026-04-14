import { ValidationError } from "../errors/validation.error";

export class Password {
    private constructor(private readonly value: string) { }

    static create(hash: string): Password {
        if (!hash) throw new ValidationError("Invalid password hash");
        return new Password(hash);
    }

    static restore(hash: string): Password {
        if (!hash) throw new ValidationError("Invalid password hash");
        return new Password(hash);
    }

    getValue(): string {
        return this.value;
    }

    toJSON(): string {
        return this.value;
    }
}