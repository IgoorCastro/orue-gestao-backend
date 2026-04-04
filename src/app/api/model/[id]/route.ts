import { DomainError } from "@/src/domain/errors/domain.error";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../mapDomainErrorToStatus.error";
import { PrismaModelRepository } from "@/src/infrastructure/database/repositories/prisma-model.repository";
import { FindModelsUseCase } from "@/src/application/model/usecase/model-find.usecase";
import { UpdateModelUseCase } from "@/src/application/model/usecase/model-save.usecase";
import { DeleteModelByIdUseCase } from "@/src/application/model/usecase/model-delete.usecase";

// GET por ID
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const modelRepository = new PrismaModelRepository(prisma);
        const findManyUseCase = new FindModelsUseCase(modelRepository);

        const { id } = await params;
        // usecase findmany
        const models = await findManyUseCase.execute({
            id,
        });

        return NextResponse.json(models, { status: 200 });
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

// UPDATE BY ID
// passar o id via PARAMS
// 
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();
        const { id } = await params;

        // validação basica
        if (Object.keys(body).length === 0)
            return NextResponse.json(
                { message: "Nenhum dado para atualizar" },
                { status: 400 }
            );

        const updateModelUseCase = new UpdateModelUseCase(new PrismaModelRepository(prisma));

        const model = await updateModelUseCase.execute({
            id,
            name: body.name,
        })

        return NextResponse.json(model, { status: 200 });
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


// delete por id
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: "Id cannot be empty" },
                { status: 400 }
            );
        }

        const modelRepository = new PrismaModelRepository(prisma);
        const deleteModelUseCase = new DeleteModelByIdUseCase(modelRepository);

        await deleteModelUseCase.execute({ id });

        return NextResponse.json(
            { message: "Material deleted" },
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