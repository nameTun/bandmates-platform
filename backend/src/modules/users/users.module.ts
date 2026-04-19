import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';

@Module({
    // TypeOrmModule.forFeature([User]): Đăng ký entity User với module này, 
    // giúp chúng ta có thể inject Repository<User> vào UsersService.
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService], // Export UsersService để AuthModule có thể sử dụng (ví dụ: tìm user khi login)
})
export class UsersModule { }
