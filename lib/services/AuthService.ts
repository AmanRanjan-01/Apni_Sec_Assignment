import bcrypt from "bcryptjs";
import { UserRepository } from "@/lib/repositories/UserRepository";
import { JwtService } from "@/lib/services/JwtService";
import { EmailService } from "@/lib/services/EmailService";
import { User } from "@/app/generated/prisma";

export interface RegisterDto {
    email: string;
    password: string;
    name?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResult {
    success: boolean;
    user?: Omit<User, "passwordHash">;
    accessToken?: string;
    refreshToken?: string;
    error?: string;
}

export class AuthService {
    private static instance: AuthService;
    private userRepository: UserRepository;
    private jwtService: JwtService;
    private emailService: EmailService;

    private constructor() {
        this.userRepository = UserRepository.getInstance();
        this.jwtService = JwtService.getInstance();
        this.emailService = EmailService.getInstance();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public async register(dto: RegisterDto): Promise<AuthResult> {
        // Check if user exists
        const existing = await this.userRepository.findByEmail(dto.email);
        if (existing) {
            return { success: false, error: "Email already registered" };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 12);

        // Create user
        const user = await this.userRepository.create({
            email: dto.email,
            passwordHash,
            name: dto.name,
        });

        // Generate token pair (access + refresh)
        const tokens = await this.jwtService.generateTokenPair({
            userId: user.id,
            email: user.email,
        });

        // Send welcome email (non-blocking)
        this.emailService.sendWelcomeEmail(user.email, user.name || "").catch(console.error);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            success: true,
            user: userWithoutPassword,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    public async login(dto: LoginDto): Promise<AuthResult> {
        const user = await this.userRepository.findByEmail(dto.email);

        if (!user) {
            return { success: false, error: "Invalid email or password" };
        }

        const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isValidPassword) {
            return { success: false, error: "Invalid email or password" };
        }

        // Generate token pair (access + refresh)
        const tokens = await this.jwtService.generateTokenPair({
            userId: user.id,
            email: user.email,
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            success: true,
            user: userWithoutPassword,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    public async verifyToken(token: string): Promise<Omit<User, "passwordHash"> | null> {
        const payload = this.jwtService.verify(token);

        if (!payload) return null;

        const user = await this.userRepository.findById(payload.userId);

        if (!user) return null;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }

    public async logout(refreshToken?: string): Promise<void> {
        if (refreshToken) {
            await this.jwtService.revokeRefreshToken(refreshToken);
        }
    }

    public async logoutAllDevices(userId: string): Promise<void> {
        await this.jwtService.revokeAllUserTokens(userId);
    }

    public async getUserById(id: string): Promise<Omit<User, "passwordHash"> | null> {
        const user = await this.userRepository.findById(id);
        if (!user) return null;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
