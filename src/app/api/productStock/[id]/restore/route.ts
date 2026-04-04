// api/id/restore
// Rota responsavel por restaurar
// produtos em estoque deletados atravez do id
// Rota PATCH -> altera o estado de deletedAt para vazio

import { DomainError } from "@/src/domain/errors/domain.error";
import { NextRequest, NextResponse } from "next/server";
import { RestoreProductStockByIdUseCase } from "@/src/application/product-stock/usecase/product-stock-restore.usecase";
import { PrismaProductStockRepository } from "@/src/infrastructure/database/repositories/prisma-product-stock.repository";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import mapDomainErrorToStatus from "../../../mapDomainErrorToStatus.error";

// Rota PATCH
export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const restoreUseCase = new RestoreProductStockByIdUseCase(new PrismaProductStockRepository(prisma));

        await restoreUseCase.execute({ id });

        return NextResponse.json(
            {message: "Product stock restored"},
            { status: 200 }
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