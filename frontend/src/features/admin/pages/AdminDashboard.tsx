import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { 
  Users, 
  FileText, 
  ClipboardCheck, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Target,
  Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { adminService, type AdminStatistics } from '../services/admin.service';

import AdminPageHeader from '../components/AdminPageHeader';

const bandColor = (b: number) => {
  if (b >= 7) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (b >= 6) return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-rose-50 text-rose-700 border-rose-100';
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite-preview');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStatistics();
        setStats(data);
        
        // Mặc định chọn model đầu tiên nếu model preview không tồn tại
        if (data.aiUsage.length > 0 && !data.aiUsage.find(u => u.modelName === 'gemini-3.1-flash-lite-preview')) {
            setSelectedModel(data.aiUsage[0].modelName);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
        message.error('Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-white">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#f97316' }} spin />} />
      </div>
    );
  }

  const selectedModelData = stats?.aiUsage.find(u => u.modelName === selectedModel);

  const statsOverview = [
    {
      label: 'Tổng người dùng',
      value: stats?.users.total.toLocaleString() || '0',
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/10',
      icon: <Users className="w-5 h-5 text-white" />,
    },
    {
      label: 'Tổng đề thi',
      value: stats?.prompts.total.toLocaleString() || '0',
      color: 'from-purple-500 to-fuchsia-600',
      shadow: 'shadow-purple-500/10',
      icon: <FileText className="w-5 h-5 text-white" />,
    },
    {
      label: 'Bài đã chấm',
      value: stats?.attempts.total.toLocaleString() || '0',
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/10',
      icon: <ClipboardCheck className="w-5 h-5 text-white" />,
    },
    {
      label: 'Tỷ lệ Bài luận',
      value: stats ? `${((stats.prompts.task2 / stats.prompts.total) * 100).toFixed(0)}%` : '0%',
      color: 'from-orange-500 to-rose-600',
      shadow: 'shadow-orange-500/10',
      icon: <TrendingUp className="w-5 h-5 text-white" />,
    },
  ];

  const maxTopicCount = stats?.topTopics[0]?.count || 1;

  const getProgressColor = (percent: number) => {
    if (percent > 90) return '#f43f5e'; // rose-500
    if (percent > 70) return '#f59e0b'; // amber-500
    return '#10b981'; // emerald-500
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-orange-500/10">
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* ── Header ── */}
        <AdminPageHeader 
          badgeText="Realtime Dashboard"
          badgeColor="bg-orange-500"
          title="Tổng quan"
          accentTitle="Hệ thống"
          accentColor="text-orange-500"
          subtitle="Giám sát sức khỏe nền tảng và hoạt động luyện tập của học viên."
          icon={<Activity className="w-5 h-5" />}
        >
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl shadow-sm hover:border-slate-300 transition-all active:scale-95 uppercase tracking-wider">
            Xuất báo cáo
          </button>
          <button className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-wider">
            Tạo dữ liệu mới
          </button>
        </AdminPageHeader>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsOverview.map((stat) => (
            <div 
              key={stat.label} 
              className="group bg-white border border-slate-200/60 rounded-[24px] p-6 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 hover:-translate-y-1 cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-500`}>
                  {stat.icon}
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-300 group-hover:text-orange-500 transition-colors">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 mb-0.5 tracking-tight tabular-nums">
                  {stat.value}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── AI Quota Monitoring ── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Giám sát hạn mức AI</h3>
              <p className="text-xs text-slate-400 font-medium tracking-tight uppercase">Phân tích hiệu suất & định mức %</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (4/12) - List */}
            <div className="lg:col-span-4 space-y-3">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Danh sách Model</div>
               {stats?.aiUsage.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-[24px] py-8 text-center text-xs text-slate-400">
                    Chưa có hoạt động.
                  </div>
               ) : (
                  [...stats!.aiUsage]
                  .sort((a, b) => {
                    const priority = [
                      'gemini-3.1-flash-lite-preview', 
                      'gemini-3-flash-preview', 
                      'gemini-2.5-flash', 
                      'gemini-2.5-flash-lite'
                    ];
                    const indexA = priority.indexOf(a.modelName);
                    const indexB = priority.indexOf(b.modelName);
                    
                    // Nếu không tìm thấy trong priority, đẩy xuống cuối cùng (999)
                    const posA = indexA === -1 ? 999 : indexA;
                    const posB = indexB === -1 ? 999 : indexB;
                    
                    return posA - posB;
                  })
                  .map((usage) => (
                    <div 
                      key={usage.modelName}
                      onClick={() => setSelectedModel(usage.modelName)}
                      className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                        selectedModel === usage.modelName 
                        ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-200 translate-x-1' 
                        : 'bg-white border-slate-200/60 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                             selectedModel === usage.modelName ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-500'
                         }`}>
                            {usage.modelName.includes('pro') ? 'PRO' : 'FL'}
                         </div>
                         <div className="min-w-0">
                            <div className={`text-xs font-black truncate capitalize ${selectedModel === usage.modelName ? 'text-white' : 'text-slate-900'}`}>
                                {usage.modelName.replace('gemini-', '').replace(/-/g, ' ')}
                            </div>
                            <div className={`text-[10px] font-black uppercase tracking-tight drop-shadow-[0_0_8px_rgba(249,115,22,0.3)] animate-pulse ${
                                selectedModel === usage.modelName ? 'text-orange-400' : 'text-orange-500'
                            }`}>
                                RPM: {usage.rpm.current}/{usage.rpm.limit} • RPD: {usage.rpd.current}/{usage.rpd.limit}
                            </div>
                         </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${selectedModel === usage.modelName ? 'text-orange-400 translate-x-1' : 'text-slate-200'}`} />
                    </div>
                  ))
               )}
            </div>

            {/* Right Column (8/12) - Dashboard Charts */}
            <div className="lg:col-span-8">
               <div className="bg-white border border-slate-200/60 rounded-[32px] p-8 h-full shadow-sm">
                  {selectedModelData ? (
                    <div className="h-full flex flex-col">
                       <div className="flex items-center justify-between mb-10">
                          <div>
                             <h4 className="text-xl font-black text-slate-900 tracking-tight capitalize">
                                {selectedModelData.modelName.replace('gemini-', '').replace(/-/g, ' ')}
                             </h4>
                             <p className="text-xs text-slate-400 font-medium mt-1">Cập nhật: {formatDistanceToNow(new Date(selectedModelData.lastRequestAt), { addSuffix: true, locale: vi })}</p>
                          </div>
                          <div className="flex gap-2 text-orange-500">
                             <Activity className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Mức độ sử dụng %</span>
                          </div>
                       </div>

                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4">
                          <div className="flex flex-col items-center">
                            <div className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8">Requests Per Minute</div>
                            <div className="relative">
                               <div className="absolute inset-0 flex flex-col items-center justify-center z-10 -mt-4">
                                  <span className="text-4xl font-black text-slate-900 tabular-nums">{selectedModelData.rpm.percent}%</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">RPM</span>
                               </div>
                               <div className="transform scale-125">
                                 <svg width="180" height="120" viewBox="0 0 180 120">
                                    <path d="M 30 110 A 60 60 0 1 1 150 110" fill="none" stroke="#f1f5f9" strokeWidth="16" strokeLinecap="round" />
                                    <path 
                                      d="M 30 110 A 60 60 0 1 1 150 110" 
                                      fill="none" 
                                      stroke={getProgressColor(selectedModelData.rpm.percent)} 
                                      strokeWidth="16" 
                                      strokeLinecap="round"
                                      strokeDasharray={`${(selectedModelData.rpm.percent / 100) * 235} 235`}
                                      className="transition-all duration-1000 ease-out"
                                    />
                                 </svg>
                               </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8">Requests Per Day</div>
                            <div className="relative">
                               <div className="absolute inset-0 flex flex-col items-center justify-center z-10 -mt-4">
                                  <span className="text-4xl font-black text-slate-900 tabular-nums">{selectedModelData.rpd.percent}%</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">RPD</span>
                               </div>
                               <div className="transform scale-125">
                                 <svg width="180" height="120" viewBox="0 0 180 120">
                                    <path d="M 30 110 A 60 60 0 1 1 150 110" fill="none" stroke="#f1f5f9" strokeWidth="16" strokeLinecap="round" />
                                    <path 
                                      d="M 30 110 A 60 60 0 1 1 150 110" 
                                      fill="none" 
                                      stroke={getProgressColor(selectedModelData.rpd.percent)} 
                                      strokeWidth="16" 
                                      strokeLinecap="round"
                                      strokeDasharray={`${(selectedModelData.rpd.percent / 100) * 235} 235`}
                                      className="transition-all duration-1000 ease-out"
                                    />
                                 </svg>
                               </div>
                            </div>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                       Hãy chọn một model để xem chi tiết % sử dụng.
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Attempts */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Bài làm gần đây</h3>
              </div>
              <button className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1 uppercase tracking-wider">
                Tất cả <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {stats?.attempts.recent.length === 0 ? (
                <div className="bg-white border border-slate-200/60 rounded-[24px] p-16 text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Activity className="w-6 h-6 text-slate-200" />
                   </div>
                   <p className="text-slate-400 text-sm font-medium">Chưa có hoạt động nào được ghi nhận.</p>
                </div>
              ) : (
                stats?.attempts.recent.map((item) => (
                  <div key={item.id} className="group bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-xl hover:shadow-slate-200 transition-all duration-300">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-transform group-hover:scale-105 duration-300 ${item.user === 'Guest' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        {item.user.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-slate-900 truncate">{item.user}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase">{item.task.replace(/task_|_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 font-medium"><Target className="w-3.5 h-3.5" /> {item.topic}</span>
                        <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center justify-center min-w-[3.5rem] py-1 rounded-xl text-sm font-black border ${bandColor(item.band)}`}>
                        {item.band.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Trends */}
          <div className="space-y-6">
             <div className="bg-white border border-slate-200/60 rounded-[32px] p-8 shadow-xl shadow-slate-200/30">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Chủ đề thịnh hành</h3>
                </div>

                <div className="space-y-6">
                  {stats?.topTopics.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-12 italic">Đang tổng hợp dữ liệu xu hướng...</div>
                  ) : (
                    stats?.topTopics.map((topic, i) => (
                      <div key={topic.name} className="group/topic cursor-default">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-3">
                             <span className="text-xs font-black text-slate-300 w-4 tracking-tighter">{i + 1}</span>
                             <span className="text-sm font-bold text-slate-700 group-hover/topic:text-orange-600 transition-colors">{topic.name}</span>
                          </div>
                          <span className="text-[11px] font-black text-slate-900">{topic.count} <span className="text-slate-400 font-bold uppercase ml-0.5 tracking-tighter">Lượt</span></span>
                        </div>
                        <div className="w-full bg-slate-50 rounded-full h-2 padding-[1px]">
                          <div
                            className={`h-2 rounded-full transition-all duration-1000 bg-gradient-to-r from-orange-400 to-amber-500`}
                            style={{ width: `${(topic.count / maxTopicCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
             </div>

             {/* Insight Card */}
             <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[28px] p-6 shadow-2xl shadow-slate-400/20 group">
                 <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-orange-400" />
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Hệ thống AI</span>
                 </div>
                 <h4 className="text-white font-black text-sm mb-2 group-hover:text-orange-300 transition-colors">Hiệu suất Gemini 1.5 Pro</h4>
                 <p className="text-slate-400 text-xs leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                   Lượt chấm gần nhất phản hồi trong <span className="text-white font-bold">1.2 giây</span>. Tỷ lệ chính xác ước tính đạt 98.4%.
                 </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
