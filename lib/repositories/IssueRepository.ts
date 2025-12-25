import { prisma } from "@/lib/db";
import { Issue, IssueType, IssueStatus, IssuePriority } from "@/app/generated/prisma";

export interface CreateIssueDto {
    type: IssueType;
    title: string;
    description: string;
    status?: IssueStatus;
    priority?: IssuePriority;
    userId: string;
}

export interface UpdateIssueDto {
    type?: IssueType;
    title?: string;
    description?: string;
    status?: IssueStatus;
    priority?: IssuePriority;
}

export interface IssueFilters {
    type?: IssueType;
    status?: IssueStatus;
    priority?: IssuePriority;
}

export class IssueRepository {
    private static instance: IssueRepository;

    public static getInstance(): IssueRepository {
        if (!IssueRepository.instance) {
            IssueRepository.instance = new IssueRepository();
        }
        return IssueRepository.instance;
    }

    public async findById(id: string): Promise<Issue | null> {
        return prisma.issue.findUnique({ where: { id } });
    }

    public async findByIdAndUser(id: string, userId: string): Promise<Issue | null> {
        return prisma.issue.findFirst({ where: { id, userId } });
    }

    public async findAllByUser(userId: string, filters?: IssueFilters): Promise<Issue[]> {
        const where: Record<string, unknown> = { userId };

        if (filters?.type) where.type = filters.type;
        if (filters?.status) where.status = filters.status;
        if (filters?.priority) where.priority = filters.priority;

        return prisma.issue.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
    }

    public async create(data: CreateIssueDto): Promise<Issue> {
        return prisma.issue.create({ data });
    }

    public async update(id: string, userId: string, data: UpdateIssueDto): Promise<Issue | null> {
        const issue = await this.findByIdAndUser(id, userId);
        if (!issue) return null;

        return prisma.issue.update({ where: { id }, data });
    }

    public async delete(id: string, userId: string): Promise<boolean> {
        const issue = await this.findByIdAndUser(id, userId);
        if (!issue) return false;

        await prisma.issue.delete({ where: { id } });
        return true;
    }

    public async count(userId: string): Promise<number> {
        return prisma.issue.count({ where: { userId } });
    }
}
