import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

/* ──── Mock Data (sẽ thay bằng API thật sau) ──── */
const mockStats = {
  avgBand: 6.5,
  totalEssays: 12,
  totalWords: 48,
  streak: 3,
};

const mockHistory = [
  { id: 1, task: 'Task 2', topic: 'Environment', band: 7.0, time: '2 giờ trước' },
  { id: 2, task: 'Task 1', topic: 'Line Graph', band: 6.5, time: '1 ngày trước' },
  { id: 3, task: 'Task 2', topic: 'Technology', band: 6.0, time: '2 ngày trước' },
  { id: 4, task: 'Task 1', topic: 'Pie Chart', band: 7.5, time: '3 ngày trước' },
];

const mockWeekly = [
  { day: 'T2', score: 5.5 },
  { day: 'T3', score: 6.0 },
  { day: 'T4', score: 6.0 },
  { day: 'T5', score: 6.5 },
  { day: 'T6', score: 7.0 },
  { day: 'T7', score: 6.5 },
  { day: 'CN', score: 7.0 },
];

const bandColor = (b: number) => {
  if (b >= 7) return 'text-emerald-600 bg-emerald-50';
  if (b >= 6) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
};

/* ──── Mini Bar Chart (pure CSS) ──── */
const MiniChart: React.FC<{ data: typeof mockWeekly }> = ({ data }) => {
  const max = 9;
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const h = (d.score / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500">{d.score}</span>
            <div className="w-full rounded-t-md bg-slate-100 relative" style={{ height: '100%' }}>
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-indigo-500 to-indigo-400 transition-all duration-700"
                style={{ height: `${h}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-400">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ──── DASHBOARD ──── */
const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {greeting()}, {user?.name || 'bạn'}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Đây là tổng quan tiến độ học tập của bạn.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Band trung bình',
              value: mockStats.avgBand.toFixed(1),
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
              value: mockStats.totalEssays.toString(),
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
              iconBg: 'bg-emerald-500',
            },
            {
              label: 'Từ đã tra',
              value: mockStats.totalWords.toString(),
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
              color: 'text-violet-600 bg-violet-50 border-violet-100',
              iconBg: 'bg-violet-500',
            },
            {
              label: 'Streak',
              value: `🔥 ${mockStats.streak}`,
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
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
                <h3 className="text-sm font-bold text-slate-800">Tiến bộ Band Score</h3>
                <p className="text-xs text-slate-400 mt-0.5">7 ngày gần nhất</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +1.5 so với tuần trước
              </div>
            </div>
            <MiniChart data={mockWeekly} />
          </div>

          {/* Quick Actions - 1 col */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Hành động nhanh</h3>
            <div className="flex flex-col gap-3 flex-1">
              <Link
                to="/practice"
                className="flex items-center gap-3 px-4 py-3.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-500 text-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Luyện viết mới</p>
                  <p className="text-[11px] text-slate-500">Task 1 hoặc Task 2</p>
                </div>
              </Link>
              <Link
                to="/vocabulary"
                className="flex items-center gap-3 px-4 py-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Tra từ vựng</p>
                  <p className="text-[11px] text-slate-500">IPA, ví dụ, đồng nghĩa</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Bài làm gần đây</h3>
            <Link to="/history" className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
              Xem tất cả →
            </Link>
          </div>
          <div>
            {mockHistory.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                  i < mockHistory.length - 1 ? 'border-b border-slate-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                    {item.task === 'Task 1' ? '📊' : '📝'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {item.task} <span className="text-slate-400 font-normal">·</span> {item.topic}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
                <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${bandColor(item.band)}`}>
                  {item.band.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
