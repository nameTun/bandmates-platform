import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';

@Injectable()
export class UsersService {
    constructor(
        // @InjectRepository: Inject Repository của TypeORM tương ứng với entity User.
        // Repository cung cấp các hàm thao tác database sẵn có (find, save, delete...).
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    // Mở rộng kiểu dữ liệu đầu vào để chấp nhận thêm trường name và avatarUrl
    async createUser(userData: Partial<User> & { name?: string, avatarUrl?: string }): Promise<User> {
        const { name, avatarUrl, ...userProps } = userData;

        const newUser = new User();
        // Gán các thuộc tính cơ bản của User (email, password, roles...)
        Object.assign(newUser, userProps);

        // Khởi tạo Profile đi kèm và gán tên hiển thị, ảnh đại diện
        const profile = new UserProfile();
        profile.displayName = name || '';
        profile.avatarUrl = avatarUrl || null;
        profile.user = newUser; // Đảm bảo mối quan hệ 2 chiều
        newUser.profile = profile;

        // Nhờ { cascade: true } ở Entity User, TypeORM sẽ tự động lưu cả Profile vào DB
        return this.usersRepository.save(newUser);
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            relations: ['profile'] // Lấy kèm thông tin Profile
        });
    }

    // cách viết khác nếu không dùng addSelect
    // async findUserByEmailWithPassword(email: string): Promise<User | null> {
    //     return this.usersRepository.findOne({
    //         where: { email },
    //         select: {
    //             id: true,
    //             email: true,
    //             password: true,
    //             role: true,
    //             profile: { // Phải liệt kê cả các cột của bảng profile ở đây
    //                 id: true,
    //                 displayName: true,
    //                 isOnboardingCompleted: true
    //             }
    //         },
    //         relations: {
    //             profile: true
    //         }
    //     });
    // }
    async findUserByEmailWithPassword(email: string): Promise<User | null> {
        return this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile') // Load profile một cách tường minh
            .where('user.email = :email', { email })
            .addSelect('user.password') // Bật cột password (vốn bị select: false trong Entity User)
            .getOne();
    }

    async findUserById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { id },
            relations: ['profile'] // Lấy kèm thông tin Profile
        });
    }

    // Dùng riêng cho luồng Refresh Token - cần đọc cột refreshToken bị ẩn (select: false)
    async findUserByIdWithRefreshToken(id: string): Promise<User | null> {
        return this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile') // Phải load profile để Frontend biết đã xong onboarding chưa
            .where('user.id = :id', { id })
            .addSelect('user.refreshToken') // Chủ động bật cột bị ẩn lên
            .getOne();
    }

    // --- ADMIN METHODS ---

    /**
     * Lấy danh sách người dùng với các thông số phân tích (dành cho Admin)
     */
    async findAll(query: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        provider?: string;
    }) {
        const { page = 1, limit = 10, search, role, provider } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.profile', 'profile')
            // Join với bảng ExamAttempt để tính toán các chỉ số
            .leftJoin('exam_attempts', 'attempt', 'attempt.userId = user.id AND attempt.status = :status', { status: 'success' })
            .select([
                'user.id',
                'user.email',
                'user.role',
                'user.isActive',
                'user.googleId',
                'user.facebookId',
                'user.createdAt',
                'profile.displayName',
                'profile.avatarUrl',
            ])
            // Thêm các cột tính toán (Raw select)
            .addSelect('COUNT(attempt.id)', 'totalEssays')
            .addSelect('AVG(attempt.overallScore)', 'avgBand')
            .groupBy('user.id')
            .addGroupBy('profile.id');

        // Áp dụng bộ lọc tìm kiếm (Email hoặc Tên)
        if (search) {
            queryBuilder.andWhere(
                '(user.email LIKE :search OR profile.displayName LIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Áp dụng bộ lọc vai trò
        if (role) {
            queryBuilder.andWhere('user.role = :role', { role });
        }

        // Áp dụng bộ lọc phương thức đăng nhập
        if (provider) {
            if (provider === 'google') {
                queryBuilder.andWhere('user.googleId IS NOT NULL');
            } else if (provider === 'facebook') {
                queryBuilder.andWhere('user.facebookId IS NOT NULL');
            } else if (provider === 'email') {
                queryBuilder.andWhere('user.googleId IS NULL AND user.facebookId IS NULL');
            }
        }

        // Thực hiện phân trang
        const total = await queryBuilder.getCount();
        const rawResults = await queryBuilder
            .orderBy('user.createdAt', 'DESC')
            .offset(skip)
            .limit(limit)
            .getRawAndEntities();

        // Map lại dữ liệu để trả về định dạng đẹp cho Frontend
        const items = rawResults.entities.map((user, index) => {
            const raw = rawResults.raw[index];
            return {
                ...user,
                totalEssays: parseInt(raw.totalEssays) || 0,
                avgBand: parseFloat(raw.avgBand) || 0,
            };
        });

        return {
            items,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async updateUser(id: string, updateData: Partial<User>): Promise<void> {
        await this.usersRepository.update(id, updateData);
    }

    // Cập nhật thông tin Profile (dùng cho việc đồng bộ Avatar/DisplayName)
    async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['profile']
        });

        if (user && user.profile) {
            Object.assign(user.profile, data);
            await this.usersRepository.save(user);
        }
    }

    /**
     * Lấy thống kê số lượng người dùng mới (Today, Month, Year)
     */
    async getStats() {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const [today, month, year] = await Promise.all([
            this.usersRepository.count({ where: { createdAt: MoreThanOrEqual(startOfToday) } }),
            this.usersRepository.count({ where: { createdAt: MoreThanOrEqual(startOfMonth) } }),
            this.usersRepository.count({ where: { createdAt: MoreThanOrEqual(startOfYear) } }),
        ]);

        return { today, month, year };
    }
}
