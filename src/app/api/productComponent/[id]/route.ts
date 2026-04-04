// Rota dinamica com params
// Rota GET -> Pesquisa uma composição via ID
// Rota PATCH -> Atualiza um registro via Id
// Rota DELETE -> Soft delete para composição de produtos

import { FindProductComponentByIdUseCase } from "@/src/application/product-component/use-case/product-component-find-byId.usecase";
import { DomainError } from "@/src/domain/errors/domain.error";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { PrismaProductComponentRepository } from "@/src/infrastructure/database/repositories/prisma-product-component.repository";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../mapDomainErrorToStatus.error";
import { UpdateProductComponentUseCase } from "@/src/application/product-component/use-case/product-component-save.usecase";
import { PrismaProductRepository } from "@/src/infrastructure/database/repositories/prisma-product.repository";
import { DeleteProductComponentByIdUseCase } from "@/src/application/product-component/use-case/product-component-delete.usecase";

// Rota GET
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const pcRepository = new PrismaProductComponentRepository(prisma);
        const findUniqueUseCase = new FindProductComponentByIdUseCase(pcRepository);

        const pc = await findUniqueUseCase.execute({ id });

        return NextResponse.json(pc, { status: 200 })
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

// Rota PATCH
// body esperado: parentId, componentId e quantity
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();
        const { id } = await params;

        function makeUpdatePcUseCase() {
            const psRepository = new PrismaProductComponentRepository(prisma);
            const productRepository = new PrismaProductRepository(prisma);
            return new UpdateProductComponentUseCase(psRepository, productRepository);
        }

        const updatePsUseCase = makeUpdatePcUseCase();
        const ps = await updatePsUseCase.execeute({
            id,
            parentProductId: body.parentId,
            componentProductId: body.componentId,
            quantity: body.quantity,
        });

        return NextResponse.json(ps, { status: 200 })

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

// Rota DELETE
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try{
        const { id } = await params;

        const deleteUseCase = new DeleteProductComponentByIdUseCase(new PrismaProductComponentRepository(prisma));
        await deleteUseCase.execute({ id });

        return NextResponse.json(
            { message: "Product component deleted" },
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