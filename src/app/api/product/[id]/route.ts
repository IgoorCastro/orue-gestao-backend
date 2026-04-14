import { FindProductByIdUseCase } from "@/src/application/product/use-case/product-find-byId.usecase";
import { DomainError } from "@/src/domain/errors/domain.error";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { PrismaProductRepository } from "@/src/infrastructure/database/repositories/prisma-product.repository";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../mapDomainErrorToStatus.error";
import { UpdateProductUseCase } from "@/src/application/product/use-case/product-save.usecase";
import { PrismaColorRepository } from "@/src/infrastructure/database/repositories/prisma-color.repository";
import { PrismaMaterialRepository } from "@/src/infrastructure/database/repositories/prisma-material.repository";
import { PrismaModelRepository } from "@/src/infrastructure/database/repositories/prisma-model.repository";
import { DefaultSkuGenerator } from "@/src/domain/services/default-sku-generator";
import { DeleteProductByIdUseCase } from "@/src/application/product/use-case/product-delete.usecase";

// GET via ID com params
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const productRepository = new PrismaProductRepository(prisma);
        const findManyUseCase = new FindProductByIdUseCase(productRepository);

        const { id } = await params;

        const product = await findManyUseCase.execute({ id });

        return NextResponse.json(product, { status: 200 });
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

// Update via ID
// campos possiveis:
// name, price, mlProductId, modelId, type, size, colors e materials
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();
        const { id } = await params;

        if (Object.keys(body).length === 0)
            return NextResponse.json(
                { message: "Nenhum dado para atualizar" },
                { status: 400 }
            );

        console.log("BODY: ", body)

        function makeUpdateProductUseCase() {
            const productRepository = new PrismaProductRepository(prisma);
            const colorRepository = new PrismaColorRepository(prisma);
            const materialRepository = new PrismaMaterialRepository(prisma);
            const modelRepository = new PrismaModelRepository(prisma);
            const skuService = new DefaultSkuGenerator();

            return new UpdateProductUseCase(productRepository, colorRepository, materialRepository, skuService, modelRepository);
        }

        const updateUseCase = makeUpdateProductUseCase();

        const product = await updateUseCase.execute({
            id: id,
            ...body
        });

        return NextResponse.json(product, { status: 200 });

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

// DELETE POR ID
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) 
            return NextResponse.json(
                { message: "Id cannot be empty" },
                { status: 400 }
            );

        const productRepository = new PrismaProductRepository(prisma);
        const deleteUseCase = new DeleteProductByIdUseCase(productRepository);

        await deleteUseCase.execute({ id });

        return NextResponse.json(
            { message: "Product deleted" }, 
            {  status: 200 }
        );

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