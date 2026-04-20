import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('user-profiles')
@UseGuards(JwtAuthGuard)
export class UserProfilesController {
    constructor(private readonly userProfilesService: UserProfilesService) {}

    @Get('me')
    async getMyProfile(@GetUser() user: User) {
        return this.userProfilesService.getProfile(user.id);
    }

    @Post('onboarding')
    async completeOnboarding(@GetUser() user: User, @Body() dto: UpdateUserProfileDto) {
        return this.userProfilesService.updateProfile(user.id, dto);
    }
}
