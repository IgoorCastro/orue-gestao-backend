// api/id/restore
// Rota responsavel por restaurar
// composições de produtos deletadas
// Rota PATCH -> altera o estado de deletedAt para vazio

import { DomainError } from "@/src/domain/errors/domain.error";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../../mapDomainErrorToStatus.error";
import { RestoreProductComponentByIdUseCase } from "@/src/application/product-component/use-case/product-component-restore.usecase";
import { PrismaProductComponentRepository } from "@/src/infrastructure/database/repositories/prisma-product-component.repository";
import { prisma } from "@/src/infrastructure/database/prisma/client";

// Rota PATCH
export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        console.log("ID:AKASJDASKL")

        const restoreUseCase = new RestoreProductComponentByIdUseCase(new PrismaProductComponentRepository(prisma));
        await restoreUseCase.execute({ id });

        return NextResponse.json(
            { message: "Product component restored" },
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