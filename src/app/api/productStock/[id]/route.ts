// Rota dinamica com params
// Rota GET -> Pesquisa um produto em estoque via ID
// Rota PATCH -> Atualiza um registro via Id
// Rota DELETE -> Soft delete para composição de produtos

import { DomainError } from "@/src/domain/errors/domain.error";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../mapDomainErrorToStatus.error";
import { FindProductStockById } from "@/src/application/product-stock/usecase/product-stock-find-byId.usecase";
import { PrismaProductStockRepository } from "@/src/infrastructure/database/repositories/prisma-product-stock.repository";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { UpdateProductStockUseCase } from "@/src/application/product-stock/usecase/product-stock-save.usecase";
import { PrismaProductRepository } from "@/src/infrastructure/database/repositories/prisma-product.repository";
import { PrismaStockRepository } from "@/src/infrastructure/database/repositories/prisma-stock.repository";
import { DeleteProductStockByIdUseCase } from "@/src/application/product-stock/usecase/product-stock-delete.usecase";

// Rota GET
// params esperado: id
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const findByIdUseCase = new FindProductStockById(new PrismaProductStockRepository(prisma));

        const ps = await findByIdUseCase.execute({ id });

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

// Rota PATCH
// params esperado: id
// body permitido: productId, stockId e quantity
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();
        const { id } = await params;

        // const { productId, stockId, quantity } = body;

        function makeUpdateUseCase(): UpdateProductStockUseCase {
            const psRepository = new PrismaProductStockRepository(prisma);
            const productRepository = new PrismaProductRepository(prisma);
            const stockRepository = new PrismaStockRepository(prisma);
            return new UpdateProductStockUseCase(psRepository, productRepository, stockRepository);
        }

        const updateUseCase = makeUpdateUseCase();

        const ps = updateUseCase.execute({
            id,
            ...body,
        })

        return NextResponse.json(ps, { status: 500 })

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
// Soft delete atravez de um id
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const deleteUseCase = new DeleteProductStockByIdUseCase(new PrismaProductStockRepository(prisma));
        await deleteUseCase.execute({ id });

        return NextResponse.json(
            { message: "Product stock deleted" },
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