import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { GuestLimit } from '../../modules/scoring/entities/guest-limit.entity';

@Injectable()
export class GuestGuard implements CanActivate {
    constructor(
        @InjectRepository(GuestLimit)
        private guestLimitRepository: Repository<GuestLimit>,
        private jwtService: JwtService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const headers = request.headers;

        // Kiểm tra xem người dùng có đăng nhập hay không (có JWT hợp lệ)
        const authHeader = headers['authorization'];
        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const payload = this.jwtService.verify(token);
                console.log("user đang đăng nhập là: ", payload);
                // Đồng nhất cấu trúc với JwtStrategy
                request.user = { id: payload.userId, role: payload.role }; 
                return true; // Nếu là User đã login -> Bỏ qua rate limit này.
            } catch (err) {
                console.error("GuestGuard JWT Verify Error:", err.message);
                // Nếu người dùng có gửi token nhưng token lỗi/hết hạn -> Bắt buộc phải 401 để Frontend refresh
                throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ. Vui lòng refresh.');
            }
        }
        console.log("user đang đăng nhập là một vị khách " );
        // Nếu là Guest (chưa login hoặc token lỗi) -> Kiểm tra Visitor ID
        const visitorId = headers['x-visitor-id'];
        if (!visitorId) {
            // Bắt buộc phải có Visitor ID nếu không login
            throw new HttpException('Visitor ID is required for guests', HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra giới hạn trong Database MySQL
        let guestLimit = await this.guestLimitRepository.findOne({ where: { visitorId } });

        // Lấy ngày hiện tại (chỉ lấy phần ngày, bỏ giờ phút giây để so sánh)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!guestLimit) {
            // Nếu chưa từng ghé thăm -> Tạo mới record
            guestLimit = this.guestLimitRepository.create({
                visitorId,
                requestCount: 1,
                lastRequestDate: new Date(),
            });
        } else {
            // Nếu đã có record -> Kiểm tra ngày
            const lastRequestDate = new Date(guestLimit.lastRequestDate);
            lastRequestDate.setHours(0, 0, 0, 0);

            if (lastRequestDate.getTime() < today.getTime()) {
                // Nếu ngày lưu trong DB bé hơn hôm nay -> Reset qua ngày mới
                guestLimit.requestCount = 1;
                guestLimit.lastRequestDate = new Date();
            } else {
                // Nếu cùng ngày -> Kiểm tra số lượng
                if (guestLimit.requestCount >= 3) {
                    throw new HttpException('Guest rate limit exceeded (3 requests/day). Please login to continue.', HttpStatus.TOO_MANY_REQUESTS);
                }
                // Tăng đếm
                guestLimit.requestCount += 1;
                guestLimit.lastRequestDate = new Date();
            }
        }

        // Lưu lại vào DB
        await this.guestLimitRepository.save(guestLimit);

        return true;
    }
}
