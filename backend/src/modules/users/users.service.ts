import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

// @Injectable: Đánh dấu class này là một Provider, có thể được "tiêm" (inject) vào các class khác 
// như Controller hoặc Service khác thông qua Dependency Injection.
@Injectable()
export class UsersService {
    constructor(
        // @InjectRepository: Inject Repository của TypeORM tương ứng với entity User.
        // Repository cung cấp các hàm thao tác database sẵn có (find, save, delete...).
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    // Mở rộng kiểu dữ liệu đầu vào để chấp nhận thêm trường name (dành cho việc tạo profile)
    async createUser(userData: Partial<User> & { name?: string }): Promise<User> {
        const { name, ...userProps } = userData;
        
        // Nhờ { cascade: true } ở Entity User, TypeORM sẽ tự động insert cả vào bảng user_profiles
        const newUser = this.usersRepository.create({
            ...userProps,
            profile: {
                displayName: name || null, // Chuyển name người dùng nhập thành displayName của Profile
            }
        }); 
        
        return this.usersRepository.save(newUser);
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ 
            where: { email },
            relations: ['profile'] // Lấy kèm thông tin Profile
        });
    }

    async findUserByEmailWithPassword(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'name', 'password', 'role'] // Explicitly select password
        });
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
            .where('user.id = :id', { id })
            .addSelect('user.refreshToken') // Chủ động bật cột bị ẩn lên
            .getOne();
    }

    async updateUser(id: string, updateData: Partial<User>): Promise<void> {
        await this.usersRepository.update(id, updateData);
    }
}
