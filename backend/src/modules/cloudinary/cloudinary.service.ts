import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  /**
   * Upload hình ảnh lên Cloudinary từ Buffer
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = process.env.CLOUDINARY_FOLDER || 'BandMates/Task_1_academic'
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new BadRequestException('Upload to Cloudinary failed, no result received'));
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Xóa hình ảnh trên Cloudinary bằng Public ID
   * Public ID thường có dạng: BandMates/Task_1_academic/filename
   */
  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  /**
   * Hàm helper để trích xuất Public ID từ URL Cloudinary
   * @param url Link ảnh Cloudinary
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      // URL mẫu: https://res.cloudinary.com/cloudname/image/upload/v12345/BandMates/Task_1_academic/abc.png
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex === -1) return null;

      // Lấy phần sau /v12345/ (skip version nếu có)
      const relevantParts = parts.slice(uploadIndex + 1);
      if (relevantParts[0].startsWith('v') && !isNaN(Number(relevantParts[0].substring(1)))) {
        relevantParts.shift();
      }

      // Nối lại và bỏ extension
      const publicIdWithExt = relevantParts.join('/');
      return publicIdWithExt.split('.')[0];
    } catch (error) {
      return null;
    }
  }
}
