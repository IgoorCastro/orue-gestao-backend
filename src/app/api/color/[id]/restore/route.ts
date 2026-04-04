// rota de restore
// restaura uma cor 'deletada'

import { ColorRestoreByIdUseCase } from "@/src/application/color/usecase/color-restore.usecase";
import { DomainError } from "@/src/domain/errors/domain.error";
import { PrismaColorRepository } from "@/src/infrastructure/database/repositories/prisma-color.repository";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../../mapDomainErrorToStatus.error";
import { prisma } from "@/src/infrastructure/database/prisma/client";

// ROTA DE RESTORE
// Restaura um usuario 'deletado'
export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const colorRepository = new PrismaColorRepository(prisma);
        const restoreUseCase = new ColorRestoreByIdUseCase(colorRepository);

        await restoreUseCase.execute({ id });

        return NextResponse.json({ status: 200 });

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