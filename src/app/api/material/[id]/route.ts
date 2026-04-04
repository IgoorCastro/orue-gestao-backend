import { DomainError } from "@/src/domain/errors/domain.error";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../mapDomainErrorToStatus.error";
import { PrismaMaterialRepository } from "@/src/infrastructure/database/repositories/prisma-material.repository";
import { FindMaterialsUseCase } from "@/src/application/meterial/usecase/material-find.usecase";
import { UpdateMaterialUseCase } from "@/src/application/meterial/usecase/material-save.usecase";
import { DeleteMaterialByIdUseCase } from "@/src/application/meterial/usecase/material-delete.usecase";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const materialRepository = new PrismaMaterialRepository(prisma);
        const findManyUseCase = new FindMaterialsUseCase(materialRepository);

        const { id } = await params;
        console.log("ID: ", id)
        // usecase findmany
        const materials = await findManyUseCase.execute({
            id,
        });

        return NextResponse.json(materials, { status: 200 });
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

        const updateMaterialUseCase = new UpdateMaterialUseCase(new PrismaMaterialRepository(prisma));

        const material = await updateMaterialUseCase.execute({
            id,
            name: body.name,
        })

        return NextResponse.json(material, { status: 200 });
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

        const colorRepository = new PrismaMaterialRepository(prisma);
        const deleteMaterialUseCase = new DeleteMaterialByIdUseCase(colorRepository);

        await deleteMaterialUseCase.execute({ id });

        return NextResponse.json(
            { message: "Material deletado com sucesso" },
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