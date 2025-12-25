import { prisma } from "@/lib/db";
import { User } from "@/app/generated/prisma";

export interface CreateUserDto {
    email: string;
    passwordHash: string;
    name?: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
}

export class UserRepository {
    private static instance: UserRepository;

    public static getInstance(): UserRepository {
        if (!UserRepository.instance) {
            UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;
    }

    public async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }

    public async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } });
    }

    public async create(data: CreateUserDto): Promise<User> {
        return prisma.user.create({ data });
    }

    public async update(id: string, data: UpdateUserDto): Promise<User> {
        return prisma.user.update({ where: { id }, data });
    }

    public async delete(id: string): Promise<void> {
        await prisma.user.delete({ where: { id } });
    }
}
