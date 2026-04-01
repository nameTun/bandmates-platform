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

    async createUser(userData: Partial<User>): Promise<User> {
        const newUser = this.usersRepository.create(userData); // Tạo object User từ data (chưa lưu)
        return this.usersRepository.save(newUser); // Lưu vào DB
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findUserByEmailWithPassword(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'name', 'password', 'role'] // Explicitly select password
        });
    }

    async findUserById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
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
