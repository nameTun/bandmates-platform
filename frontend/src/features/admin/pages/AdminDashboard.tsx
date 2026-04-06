import React from 'react';

/* ── Mock Data ── */
const stats = [
  {
    label: 'Tổng đề thi',
    value: '1,842',
    change: '+24 tuần này',
    changeType: 'up' as const,
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Người dùng',
    value: '156',
    change: '+12 tuần này',
    changeType: 'up' as const,
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: 'Bài đã chấm',
    value: '3,284',
    change: '+187 tuần này',
    changeType: 'up' as const,
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Điểm TB hệ thống',
    value: '6.2',
    change: '+0.3 so với tháng trước',
    changeType: 'up' as const,
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

const recentAttempts = [
  { user: 'Nguyễn Văn A', email: 'a@gmail.com', task: 'Task 2', topic: 'Education', band: 7.0, time: '5 phút trước' },
  { user: 'Trần Thị B', email: 'b@gmail.com', task: 'Task 2', topic: 'Technology', band: 6.5, time: '12 phút trước' },
  { user: 'Lê Văn C', email: 'c@gmail.com', task: 'Task 1', topic: 'Line Graph', band: 5.5, time: '30 phút trước' },
  { user: 'Phạm Thị D', email: 'd@gmail.com', task: 'Task 2', topic: 'Health', band: 8.0, time: '1 giờ trước' },
  { user: 'Guest', email: '—', task: 'Task 2', topic: 'Environment', band: 6.0, time: '2 giờ trước' },
];

const topTopics = [
  { name: 'Education', count: 342, percent: 85 },
  { name: 'Technology', count: 298, percent: 74 },
  { name: 'Environment', count: 256, percent: 64 },
  { name: 'Health', count: 189, percent: 47 },
  { name: 'Society', count: 145, percent: 36 },
];

const bandColor = (b: number) => {
  if (b >= 7) return 'text-emerald-400 bg-emerald-400/10';
  if (b >= 6) return 'text-amber-400 bg-amber-400/10';
  return 'text-red-400 bg-red-400/10';
};

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Tổng quan Hệ thống</h1>
          <p className="text-slate-500 mt-1">Theo dõi hoạt động và quản lý nền tảng BandMates AI.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.iconBg} text-white flex items-center justify-center shadow-lg`}>
                  {stat.icon}
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-white">{stat.value}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Attempts - 2 cols */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Bài làm gần đây</h3>
              <span className="text-xs text-slate-500">Cập nhật realtime</span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-2.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-800/50">
              <div className="col-span-4">Người dùng</div>
              <div className="col-span-3">Đề bài</div>
              <div className="col-span-2">Topic</div>
              <div className="col-span-1 text-center">Band</div>
              <div className="col-span-2 text-right">Thời gian</div>
            </div>

            {/* Table Rows */}
            {recentAttempts.map((item, i) => (
              <div
                key={i}
                className={`grid grid-cols-12 items-center px-6 py-3.5 hover:bg-slate-800/50 transition-colors cursor-pointer ${
                  i < recentAttempts.length - 1 ? 'border-b border-slate-800/30' : ''
                }`}
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    item.user === 'Guest' ? 'bg-slate-700 text-slate-400' : 'bg-gradient-to-br from-blue-500 to-violet-500 text-white'
                  }`}>
                    {item.user.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{item.user}</p>
                    <p className="text-[11px] text-slate-600 truncate">{item.email}</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    item.task === 'Task 1' ? 'bg-cyan-400/10 text-cyan-400' : 'bg-violet-400/10 text-violet-400'
                  }`}>
                    {item.task}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-slate-400">{item.topic}</div>
                <div className="col-span-1 text-center">
                  <span className={`text-sm font-extrabold px-2 py-0.5 rounded-full ${bandColor(item.band)}`}>
                    {item.band.toFixed(1)}
                  </span>
                </div>
                <div className="col-span-2 text-right text-xs text-slate-600">{item.time}</div>
              </div>
            ))}
          </div>

          {/* Top Topics - 1 col */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-5">Chủ đề phổ biến</h3>
            <div className="space-y-4">
              {topTopics.map((topic, i) => (
                <div key={topic.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 w-4">{i + 1}</span>
                      <span className="text-sm font-semibold text-slate-300">{topic.name}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500">{topic.count} đề</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-400 h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${topic.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
