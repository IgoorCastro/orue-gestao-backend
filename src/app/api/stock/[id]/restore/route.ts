// api/id/restore
// Rota responsavel por restaurar
// estoques deletados
// Rota PATCH -> altera o estado de deletedAt para vazio

import { DomainError } from "@/src/domain/errors/domain.error";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../../mapDomainErrorToStatus.error";
import { RestoreStockByIdUseCase } from "@/src/application/stock/use-case/stock-restore.usecase";
import { PrismaStockRepository } from "@/src/infrastructure/database/repositories/prisma-stock.repository";
import { prisma } from "@/src/infrastructure/database/prisma/client";

// Rota PATCH
export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const restoreUseCase = new RestoreStockByIdUseCase(new PrismaStockRepository(prisma));

        await restoreUseCase.execute({ id });

        return NextResponse.json(
            { message: "Stock restored" },
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