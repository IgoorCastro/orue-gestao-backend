import { PrismaClient } from "@/generated/prisma/client";
import { BarcodeGeneratorService } from "@/src/domain/services/barcode-generator.services";

export class PrismaBarcodeGeneratorService implements BarcodeGeneratorService {
    constructor(private readonly prisma: PrismaClient) {}

    async generate(): Promise<string> {
        const sequence = await this.getNextSequence();
        const base = this.buildBase(sequence);
        const checkDigit = this.calculateCheckDigit(base);
        console.log("base + checkDigit: ", base + checkDigit)

        return base + checkDigit;
    }

    private async getNextSequence(): Promise<number> {
        const result = await this.prisma.$queryRawUnsafe<{ nextval: bigint }[]>(
            `SELECT nextval('barcode_sequence')`
        );

        return Number(result[0].nextval);
    }

    private buildBase(sequence: number): string {
        const prefix = "789";
        const seq = sequence.toString().padStart(9, "0");

        return prefix + seq;
    }

    private calculateCheckDigit(code: string): number {
        const digits = code.split("").map(Number);

        let sum = 0;

        for (let i = 0; i < digits.length; i++) {
            sum += (i % 2 === 0) ? digits[i] : digits[i] * 3;
        }

        const mod = sum % 10;
        return mod === 0 ? 0 : 10 - mod;
    }
}