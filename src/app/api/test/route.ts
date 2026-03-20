import { prisma } from "@/src/infrastructure/database/prisma/client";
import { randomUUID } from "crypto"

export async function GET() {
    const user = await prisma.user.create({
        data: {
            id: randomUUID(),
            name: "Igor",
            isActive: true,
            role: "ADMIN",
            createdAt: new Date(),
        }
    })

    return Response.json(user)
}