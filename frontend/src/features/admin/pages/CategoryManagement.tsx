import React, { useState, useEffect } from 'react';
import { message, Spin, Modal, Input } from 'antd';
import { categoryService, type Category } from '../services/category.service';
import { TaskType } from '@/common/enums/task-type.enum';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá danh mục này? Hệ thống sẽ ẩn nó khỏi danh sách đề bài.')) return;
    try {
      await categoryService.deleteCategory(id);
      message.success('Đã xoá danh mục thành công');
      fetchCategories();
    } catch (error) {
      message.error('Không thể xoá danh mục');
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedCategory || !editName.trim()) return;
    try {
      await categoryService.updateCategory(selectedCategory.id, { name: editName });
      message.success('Cập nhật thành công');
      setEditModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error('Không thể cập nhật danh mục');
    }
  };

  const groupedCategories = {
    [TaskType.TASK_2]: categories.filter(c => c.taskType === TaskType.TASK_2),
    [TaskType.TASK_1_ACADEMIC]: categories.filter(c => c.taskType === TaskType.TASK_1_ACADEMIC),
    [TaskType.TASK_1_GENERAL]: categories.filter(c => c.taskType === TaskType.TASK_1_GENERAL),
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý Dạng bài (Categories)</h1>
          <p className="text-slate-500">Chỉnh sửa hoặc xoá các loại đề thi của từng Task để tối ưu hoá việc phân loại.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><Spin size="large" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(groupedCategories).map(([type, list]) => (
              <div key={type} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-orange-500">{type.replace(/_/g, ' ')}</h3>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-semibold">{list.length} Items</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {list.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-sm">Chưa có dữ liệu</div>
                  ) : (
                    list.map(cat => (
                      <div key={cat.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                        <span className="text-sm font-medium text-slate-800">{cat.name}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(cat)}
                            className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          title={<span className="text-slate-900 font-semibold">Chỉnh sửa danh mục</span>}
          open={editModalVisible}
          onOk={handleUpdate}
          onCancel={() => setEditModalVisible(false)}
          okText="Lưu thay đổi"
          cancelText="Hủy"
          className="light-modal"
          okButtonProps={{ className: 'bg-orange-500 border-none hover:bg-orange-600' }}
        >
          <div className="py-4">
            <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Tên danh mục mới</label>
            <Input 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border-slate-300 hover:border-orange-400 focus:border-orange-500"
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CategoryManagement;
