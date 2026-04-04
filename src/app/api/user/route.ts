import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { PrismaUserRepository } from "@/src/infrastructure/database/repositories/prisma-user.repository";
import { CreateUserUseCase } from "@/src/application/user/use-case/user-create.usecase";
import { UUIDGenerator } from "@/src/infrastructure/services/uuid-generator";
import { BcryptService } from "@/src/infrastructure/services/bcrypt.service";
import { DomainError } from "@/src/domain/errors/domain.error";
import { UserRole } from "@/src/domain/enums/user-role.enum";
import { FindUsersUseCase } from "@/src/application/user/use-case/user-find.usecase";
import mapDomainErrorToStatus from "../mapDomainErrorToStatus.error";


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { name, nickname, password, role } = body;
        console.log("name: ", name);
        console.log("nickname: ", nickname);
        console.log("password: ", password);
        console.log("role: ", role);

        // validação básica (tamanho da senha ainda em string)
        if (password.length < 5) {
            return NextResponse.json(
                { message: "Dados obrigatórios não informados" },
                { status: 400 }
            );
        }

        function makeCreateUserUseCase() {
            const userRepository = new PrismaUserRepository(prisma);
            const uuid = new UUIDGenerator();
            const hash = new BcryptService();

            return new CreateUserUseCase(userRepository, uuid, hash);
        }

        const createUserUseCase = makeCreateUserUseCase();

        const user = await createUserUseCase.execute({
            name,
            nickname,
            password,
            role,
        });

        return NextResponse.json(user, { status: 201 });

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

// get all, byRole e byName
// retorna uma lista de usuarios
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const name = searchParams.get("name") ?? undefined;
        const inputRole = searchParams.get("role") ?? undefined;
        const nickname = searchParams.get("nickname") ?? undefined;
        const allowedRoles = Object.keys(UserRole);
        const role = allowedRoles.includes(inputRole as UserRole)
            ? inputRole as UserRole
            : undefined;

        const findManyUseCase = new FindUsersUseCase(new PrismaUserRepository(prisma));

        // useCase findMany executando
        const users = await findManyUseCase.execute({
            name,
            nickname,
            role: role as UserRole | undefined,
        });

        return NextResponse.json(users, { status: 200 });

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