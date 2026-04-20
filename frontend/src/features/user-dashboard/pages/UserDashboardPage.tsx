import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { userDashboardService } from '@/features/user-dashboard/services/user-dashboard.service';
import type { DashboardStats } from '@/features/user-dashboard/services/user-dashboard.service';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

const bandColor = (b: number) => {
  if (b >= 7) return 'text-emerald-600 bg-emerald-50';
  if (b >= 6) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
};

/* ──── USER DASHBOARD ──── */
const UserDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const data = await userDashboardService.getDashboardStats();
        setStats(data);
      } catch (err) {
        const _err = err as any;
        setError(_err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-slate-500 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {greeting()}, {user?.profile?.displayName || 'bạn'}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Đây là tổng quan tiến độ học tập của bạn.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Band trung bình',
              value: stats?.statistics.averageScore.toFixed(1) || '0.0',
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
              iconBg: 'bg-indigo-500',
            },
            {
              label: 'Bài đã làm',
              value: stats?.statistics.totalEssays.toString() || '0',
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
              iconBg: 'bg-emerald-500',
            },
            {
              label: 'Mục tiêu (Band Goal)',
              value: stats?.profile.targetBand ? stats.profile.targetBand.toFixed(1) : 'Trống',
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              color: 'text-violet-600 bg-violet-50 border-violet-100',
              iconBg: 'bg-violet-500',
            },
            {
              label: 'Khởi điểm (Initial)',
              value: stats?.profile.initialBand ? stats.profile.initialBand.toFixed(1) : 'Trống',
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              ),
              color: 'text-amber-600 bg-amber-50 border-amber-100',
              iconBg: 'bg-amber-500',
            },
          ].map(stat => (
            <div key={stat.label} className={`bg-white rounded-2xl border p-5 shadow-sm ${stat.color.split(' ')[2]}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.iconBg} text-white flex items-center justify-center shadow-sm`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chart - 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Tiến bộ Điểm số</h3>
                <p className="text-xs text-slate-400 mt-0.5">Biểu đồ kết quả các bài tập gần đây</p>
              </div>
              {stats?.profile.targetBand && (
                <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                  🎯 Điểm mục tiêu: {stats.profile.targetBand.toFixed(1)}
                </div>
              )}
            </div>
            
            <div className="h-64 w-full">
              {stats && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{fill: '#94A3B8', fontSize: 10}} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(value) => {
                        // Rút gọn ngày (ví dụ 2024-03-20 -> 20/03)
                        const [, month, day] = value.split('-');
                        return `${day}/${month}`;
                      }}
                    />
                    <YAxis 
                      domain={[0, 9]} 
                      ticks={[0, 4, 5, 6, 7, 8, 9]}
                      tick={{fill: '#94A3B8', fontSize: 10}} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#475569', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
                      formatter={(value: any) => [`Band ${Number(value || 0).toFixed(1)}`, 'Điểm IELTS']}
                      labelFormatter={(label) => `Ngày thi: ${label}`}
                    />
                    {stats?.profile.targetBand && (
                      <ReferenceLine 
                        y={stats.profile.targetBand} 
                        stroke="#8B5CF6" 
                        strokeDasharray="3 3" 
                        label={{ position: 'top', value: 'Mục tiêu', fill: '#8B5CF6', fontSize: 10, fontWeight: 600 }} 
                      />
                    )}
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#6366F1" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-sm font-medium">Chưa có đủ dữ liệu</p>
                  <p className="text-xs mt-1">Hãy nộp bài viết đầu tiên để thiết lập biểu đồ theo dõi nhé!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions - 1 col */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Hành động nhanh</h3>
            <div className="flex flex-col gap-3 flex-1">
              <Link
                to="/practice"
                className="flex items-center gap-3 px-4 py-3.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Luyện viết mới</p>
                  <p className="text-[11px] text-slate-500">Giám khảo AI chấm ngay</p>
                </div>
              </Link>
              <Link
                to="/history"
                className="flex items-center gap-3 px-4 py-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Lịch sử bài làm</p>
                  <p className="text-[11px] text-slate-500">Xem lại bài tập và nhận xét</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Hoạt động gần đây</h3>
            <Link to="/history" className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
              Xem tất cả &rarr;
            </Link>
          </div>
          <div>
            {stats && stats.recentAttempts.length > 0 ? (
              stats.recentAttempts.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                    i < stats.recentAttempts.length - 1 ? 'border-b border-slate-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                      {item.title.toLowerCase().includes('graph') || item.title.toLowerCase().includes('chart') ? '📊' : '📝'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ngày làm: {new Date(item.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${bandColor(item.score)}`}>
                    {item.score.toFixed(1)}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm">Bạn chưa có bài làm nào.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboardPage;
