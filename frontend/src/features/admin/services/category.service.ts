import api from '@/lib/api';
import { TaskType } from '@/common/enums/task-type.enum';

export type Category = {
  id: string;
  name: string;
  taskType: TaskType;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export type CreateCategoryDto = {
  name: string;
  taskType: TaskType;
  description?: string;
}

export const categoryService = {
  /**
   * Lấy danh sách tất cả các dạng bài (Categories)
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  /**
   * Tạo mới một dạng bài
   */
  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  /**
   * Vô hiệu hóa một dạng bài
   */
  deactivateCategory: async (id: string): Promise<Category> => {
    const response = await api.patch(`/categories/${id}/deactivate`);
    return response.data;
  }
};
