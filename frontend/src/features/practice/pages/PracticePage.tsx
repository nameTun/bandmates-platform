import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { historyService } from '@/features/history/services/history.service';
import type { Prompt } from '@/features/practice/services/practice.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { TaskType } from '@/common/enums/task-type.enum';
import { Spin } from 'antd';
import { PracticeLibrary } from '../components/PracticeLibrary';
import { WritingWorkspace } from '../components/WritingEditor/WritingWorkspace';

const PracticePage: React.FC = () => {
  const { id: attemptId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaUserLimit, setQuotaUserLimit] = useState<number>();
  const [selectedTask, setSelectedTask] = useState<Prompt | null>(null);
  const [reviewAttempt, setReviewAttempt] = useState<any | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);

  useEffect(() => {
    if (attemptId) {
      const fetchAttempt = async () => {
        setLoadingReview(true);
        try {
          const data = await historyService.getAttemptDetail(attemptId);
          setReviewAttempt(data);
          setSelectedTask(data.prompt || ({ content: 'Bài viết tự do không dùng đề mẫu.', taskType: TaskType.TASK_2 } as any));
        } catch (error) {
          console.error(error);
          navigate('/history');
        } finally {
          setLoadingReview(false);
        }
      };
      fetchAttempt();
    }
  }, [attemptId, navigate]);

  const { isAuthenticated } = useAuthStore();

  const renderContent = () => {
    if (attemptId && (loadingReview || !reviewAttempt)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <Spin size="large" />
        </div>
      );
    }

    if (!selectedTask && !attemptId) {
      return <PracticeLibrary onSelect={setSelectedTask} />;
    }

    return (
      <WritingWorkspace
        promptObj={selectedTask as any}
        onBack={() => {
          if (attemptId) navigate('/history');
          else setSelectedTask(null);
        }}
        onError={(status, msg, extraData) => {
          const finalMessage = typeof msg === 'string' ? msg : 'Bạn đã hết lượt sử dụng AI hôm nay.';
          const finalUserLimit = (extraData as any)?.userLimit;

          setErrorMessage(finalMessage);
          if (finalUserLimit) {
            setQuotaUserLimit(finalUserLimit);
          }
          if (status === 429) setShowQuotaModal(true);
        }}
        reviewAttempt={reviewAttempt}
      />
    );
  };

  return (
    <>
      {renderContent()}

      {/* ═══ QUOTA MODAL ═══ */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-indigo-50/50">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Hết lượt luyện tập</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                {errorMessage}
              </p>

              <div className="flex flex-col gap-3">
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => navigate('/register')}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                    >
                      Đăng ký để nhận {quotaUserLimit} lượt/ngày
                    </button>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                    >
                      Đã có tài khoản? Đăng nhập
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowQuotaModal(false)}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl shadow-lg transition-all"
                  >
                    Đã hiểu
                  </button>
                )}

                {!isAuthenticated && (
                  <button
                    onClick={() => setShowQuotaModal(false)}
                    className="mt-2 text-xs text-slate-400 hover:text-slate-500 font-medium font-sans"
                  >
                    Bỏ qua lần này
                  </button>
                )}
              </div>
            </div>
            {!isAuthenticated && (
              <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider font-sans">
                  Nâng cấp tài khoản để dùng không giới hạn
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PracticePage;
