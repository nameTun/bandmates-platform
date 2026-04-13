import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserProfilesService {
    constructor(
        @InjectRepository(UserProfile)
        private profileRepository: Repository<UserProfile>,
    ) {}

    async getProfile(userId: string): Promise<UserProfile> {
        const profile = await this.profileRepository.findOne({ where: { userId } });
        if (!profile) {
            throw new NotFoundException('Không tìm thấy thông tin hồ sơ của người dùng này.');
        }
        return profile;
    }

    async updateProfile(userId: string, updateData: UpdateUserProfileDto): Promise<UserProfile> {
        let profile = await this.profileRepository.findOne({ where: { userId } });
        
        if (!profile) {
            // Dự phòng: Tự tạo nếu chưa có
            profile = this.profileRepository.create({ 
                userId, 
                ...updateData, 
                isOnboardingCompleted: true 
            });
        } else {
            // Cập nhật và đổi cờ
            Object.assign(profile, updateData);
            profile.isOnboardingCompleted = true; 
        }

        return this.profileRepository.save(profile);
    }
}
