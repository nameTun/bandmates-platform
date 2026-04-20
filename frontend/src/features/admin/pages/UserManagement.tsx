import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Tag,
  Switch,
  Avatar,
  Input,
  Select,
  Tooltip,
  message,
  Badge,
  Card
} from 'antd';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Shield,
  Activity,
  Trophy,
  UserPlus,
  Award,
  Filter
} from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { adminUserManagerService, type AdminUser, type UserStatsResponse } from '../services/admin-user-manager.service';
import { UserRole } from '@/common/enums/user-role.enum';
import AdminPageHeader from '../components/AdminPageHeader';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Option } = Select;

const UserManagement: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);
  const [statsDateRange, setStatsDateRange] = useState<'today' | 'month' | 'year'>('today');

  // Memoized Stat Value
  const currentStat = useMemo(() => {
    const defaultStat = { value: 0, label: 'Học viên mới', icon: <UserPlus className="w-5 h-5" />, color: 'slate' };
    if (!stats) return defaultStat;

    const mappings = {
      today: { value: stats.today, label: 'Học viên mới hôm nay', icon: <UserPlus className="w-5 h-5" />, color: 'emerald' },
      month: { value: stats.month, label: 'Đăng ký tháng này', icon: <Calendar className="w-5 h-5" />, color: 'blue' },
      year: { value: stats.year, label: 'Tham gia trong năm', icon: <Award className="w-5 h-5" />, color: 'orange' }
    };
    return mappings[statsDateRange] || defaultStat;
  }, [stats, statsDateRange]);

  // Fetch Data
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminUserManagerService.getUsers({
        page,
        limit: pageSize,
        search: searchQuery,
        role: roleFilter,
        provider: providerFilter
      });
      setUsers(data.items);
      setTotal(data.meta.total);
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, roleFilter, providerFilter]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await adminUserManagerService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handlers
  const handleStatusChange = async (id: string, isActive: boolean) => {
    try {
      await adminUserManagerService.updateStatus(id, isActive);
      message.success(isActive ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản');
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive } : u));
    } catch (error) {
      message.error('Thao tác thất bại');
    }
  };

  const handleRoleChange = async (id: string, role: UserRole) => {
    try {
      await adminUserManagerService.updateRole(id, role);
      message.success('Đã cập nhật quyền hạn');
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    } catch (error) {
      message.error('Thao tác thất bại');
    }
  };

  // Table Columns
  const columns: ColumnsType<AdminUser> = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.profile?.avatarUrl || undefined}
            size={42}
            className="border-2 border-white shadow-sm ring-1 ring-slate-100"
          >
            {(record.profile?.displayName || record.email).charAt(0).toUpperCase()}
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 truncate tracking-tight">
              {record.profile?.displayName || 'Chưa đặt tên'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Tham gia {record.createdAt ? format(new Date(record.createdAt), 'dd MMMM, yyyy', { locale: vi }) : '---'}
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'Thông tin liên hệ',
      key: 'contact',
      width: 250,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-600 font-medium text-xs">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            {record.email}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {record.googleId && (
              <Tooltip title="Đăng nhập qua Google">
                <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                  <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.12 5.4-7.84 5.4-4.8 0-8.68-4.12-8.68-9s3.88-9 8.68-9c2.72 0 4.56 1.16 5.6 2.16l2.6-2.52C19.04 1.48 16.04 0 12.48 0 5.84 0 0 5.36 0 12s5.84 12 12.48 12c6.92 0 11.52-4.88 11.52-11.72 0-.8-.08-1.4-.24-2.08h-11.28z" />
                  </svg>
                </div>
              </Tooltip>
            )}
            {record.facebookId && (
              <Tooltip title="Đăng nhập qua Facebook">
                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                  <svg className="w-3 h-3 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
              </Tooltip>
            )}
            {!record.googleId && !record.facebookId && (
              <Badge status="processing" text={<span className="text-[10px] font-bold text-slate-400 capitalize">Email gốc</span>} />
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Vai trò',
      key: 'role',
      width: 150,
      render: (_, record) => (
        <Select
          value={record.role}
          onChange={(val) => handleRoleChange(record.id, val)}
          className="w-full"
          suffixIcon={<Shield className="w-3 h-3 text-slate-400" />}
          bordered={false}
          dropdownStyle={{ borderRadius: '12px' }}
        >
          <Option value={UserRole.USER}>
            <Tag color="blue" className="rounded-full px-3 border-none font-bold uppercase text-[10px]">Người dùng</Tag>
          </Option>
          <Option value={UserRole.ADMIN}>
            <Tag color="orange" className="rounded-full px-3 border-none font-bold uppercase text-[10px]">Quản trị viên</Tag>
          </Option>
        </Select>
      )
    },
    {
      title: 'Hoạt động AI',
      key: 'activity',
      width: 200,
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5 leading-none">
              <Activity className="w-3.5 h-3.5" /> Tổng số bài:
            </span>
            <span className="font-black text-slate-900">{record.totalEssays}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5 leading-none">
              <Trophy className="w-3.5 h-3.5" /> Điểm TB:
            </span>
            <Badge
              count={(record.avgBand || 0).toFixed(1)}
              style={{ backgroundColor: (record.avgBand || 0) >= 7 ? '#10b981' : (record.avgBand || 0) >= 5 ? '#f59e0b' : '#ef4444' }}
              className="font-bold scale-90"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={record.isActive ? 'Đang hoạt động' : 'Tài khoản bị khóa'}>
          <Switch
            checked={record.isActive}
            onChange={(checked) => handleStatusChange(record.id, checked)}
            checkedChildren={<UserCheck className="w-3 h-3" />}
            unCheckedChildren={<UserX className="w-3 h-3" />}
            className={record.isActive ? 'bg-emerald-500' : 'bg-slate-300'}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-orange-500/20 selection:text-orange-900">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <AdminPageHeader
          badgeText="User Manager"
          badgeColor="bg-emerald-400"
          title="Danh sách"
          accentTitle="Người dùng"
          accentColor="text-emerald-500"
          subtitle={
            <span className="flex items-center gap-1.5">
              Quản lý và theo dõi hoạt động của
              <span className="text-orange-600 font-black text-lg mx-0.5 drop-shadow-sm">
                {total}
              </span>
              học viên trên hệ thống.
            </span>
          }
          icon={<Users className="w-6 h-6 text-emerald-500" />}
        />

        {/* Summary & Filters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-4 items-stretch">
          {/* Compact Stats Block (1/4) */}
          <div
            className="rounded-[32px] bg-white/60 backdrop-blur-md border border-slate-200/60 shadow-sm overflow-hidden relative group h-full py-2 px-5"
          >
            {loadingStats ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-slate-300 text-xs font-bold uppercase tracking-widest">Đang tải...</div>
              </div>
            ) : (
              <>
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <div className={`p-2.5 rounded-xl bg-${currentStat.color}-50 text-${currentStat.color}-600`}>
                      {currentStat.icon}
                    </div>
                    <Select
                      defaultValue="today"
                      size="small"
                      bordered={false}
                      className="stats-select"
                      dropdownStyle={{ borderRadius: '12px' }}
                      onChange={(val: 'today' | 'month' | 'year') => setStatsDateRange(val)}
                    >
                      <Option value="today">Hôm nay</Option>
                      <Option value="month">Tháng này</Option>
                      <Option value="year">Năm nay</Option>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight w-[45%]">
                      {currentStat.label}
                    </div>
                    <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1 justify-end flex-1">
                      {currentStat.value}
                      <span className="text-[10px] text-slate-400 font-medium">học viên</span>
                    </div>
                  </div>
                </div>
                {/* Subtle decoration */}
                <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.04] text-slate-900">
                  {React.cloneElement(currentStat.icon as React.ReactElement<{ size?: number }>, { size: 100 })}
                </div>
              </>
            )}
          </div>

          {/* Combined Filter Section (3/4) */}
          <div className="lg:col-span-3 bg-white/60 backdrop-blur-md py-1 px-4 rounded-[32px] border border-slate-200/60 shadow-sm flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[250px] relative group">
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email học viên..."
                  prefix={<Search className="w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />}
                  className="h-12 border-slate-200 hover:border-orange-200 focus:border-orange-500 rounded-2xl bg-white shadow-inner-sm transition-all text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  allowClear
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-[1px] h-8 bg-slate-200 mx-1 hidden xl:block" />

                <Select
                  placeholder="Mọi vai trò"
                  allowClear
                  className="w-40 custom-select"
                  suffixIcon={<Shield className="w-4 h-4 text-slate-400" />}
                  onChange={(val) => setRoleFilter(val)}
                >
                  <Option value={UserRole.USER}>Học viên</Option>
                  <Option value={UserRole.ADMIN}>Quản trị viên</Option>
                </Select>

                <Select
                  placeholder="Phương thức đăng nhập"
                  allowClear
                  className="w-48 custom-select"
                  suffixIcon={<Filter className="w-4 h-4 text-slate-400" />}
                  onChange={(val) => setProviderFilter(val)}
                >
                  <Option value="google">
                    <span className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-[10px] text-red-600 font-bold">G</span>
                      </div>
                      Google Account
                    </span>
                  </Option>
                  <Option value="facebook">
                    <span className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-[10px] text-blue-600 font-bold">f</span>
                      </div>
                      Facebook Login
                    </span>
                  </Option>
                  <Option value="email">
                    <span className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail className="w-3.5 h-3.5" />
                      Email gốc
                    </span>
                  </Option>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <Card className="rounded-[32px] border-slate-200/60 shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
              showSizeChanger: true,
              className: "px-6 py-4",
            }}
            className="admin-table"
          />
        </Card>

        <style>{`
        .admin-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          padding: 16px 24px;
          border-bottom: 1px solid #f1f5f9;
        }
        .admin-table .ant-table-tbody > tr > td {
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }
        .admin-table .ant-table-tbody > tr:hover > td {
          background: #fdfeff !important;
        }
        .custom-select .ant-select-selector {
          height: 48px !important;
          padding: 0 16px !important;
          display: flex !important;
          align-items: center !important;
          border-radius: 16px !important;
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          font-weight: 500 !important;
          font-size: 14px !important;
        }
        .custom-select .ant-select-selection-placeholder {
          color: #94a3b8 !important;
        }
        .custom-select:hover .ant-select-selector {
          border-color: #fbd38d !important;
        }
        .custom-select.ant-select-focused .ant-select-selector {
          border-color: #f6993f !important;
          box-shadow: 0 0 0 2px rgba(246, 153, 63, 0.1) !important;
        }
        .stats-select .ant-select-selection-item {
          font-size: 11px !important;
          font-weight: 700 !important;
          color: #94a3b8 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        .stats-select:hover .ant-select-selection-item {
          color: #f6993f !important;
        }
      `}</style>
      </div>
    </div>
  );
};

export default UserManagement;
