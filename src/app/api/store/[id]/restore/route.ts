// api/id/restore
// Rota responsavel por restaurar
// lojas deletadas
// Rota PATCH -> altera o estado de deletedAt para vazio

import { DomainError } from "@/src/domain/errors/domain.error";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../../mapDomainErrorToStatus.error";
import { RestoreStoreByIdUseCase } from "@/src/application/store/use-case/store-restore.usecase";
import { PrismaStoreRepository } from "@/src/infrastructure/database/repositories/prisma-store.repository";
import { prisma } from "@/src/infrastructure/database/prisma/client";

// Rota PATCH
export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const restoreUseCase = new RestoreStoreByIdUseCase(new PrismaStoreRepository(prisma));

        await restoreUseCase.execute({ id });

        return NextResponse.json({ message: "Store restored", status: 200 })
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