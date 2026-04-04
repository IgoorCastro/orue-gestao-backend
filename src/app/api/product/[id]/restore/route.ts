// update para restaurar produto

import { DomainError } from "@/src/domain/errors/domain.error";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../../mapDomainErrorToStatus.error";
import { PrismaProductRepository } from "@/src/infrastructure/database/repositories/prisma-product.repository";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { ProductRestoreByIdUseCase } from "@/src/application/product/use-case/product-restore.usecase";

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const productRepository = new PrismaProductRepository(prisma);
        const restoreUseCase = new ProductRestoreByIdUseCase(productRepository);

        await restoreUseCase.execute({ id });

        return NextResponse.json(
            { message: "Restored product" },
            { status: 200 },
        )
    } catch (error: unknown) {
        if (error instanceof DomainError) {
            return NextResponse.json(
                { message: error.message },
                { status: mapDomainErrorToStatus(error) }
            );
        }

        return NextResponse.json(
            { message: "Erro interno" },
            { status: 500 }
        );
    }
}