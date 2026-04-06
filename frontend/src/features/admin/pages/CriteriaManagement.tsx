import React from 'react';
import { Row, Col } from 'antd'; // Tạm giữ Row, Col của antd để chia lưới

const mockCriteriaTask1 = [
  { id: '1', name: 'Task Achievement', description: 'Đánh giá việc trả lời đầy đủ các yêu cầu của đề bài, tóm tắt chính xác các đặc điểm chính và thực hiện các so sánh cần thiết.' },
  { id: '2', name: 'Coherence & Cohesion', description: 'Đánh giá tính mạch lạc của bài viết, cách sắp xếp ý tưởng và sử dụng các từ nối liên kết các đoạn văn.' },
  { id: '3', name: 'Lexical Resource', description: 'Đánh giá vốn từ vựng phong phú, sử dụng từ ngữ chính xác, tự nhiên và đúng ngữ cảnh bài mô tả dữ liệu.' },
  { id: '4', name: 'Grammatical Range & Accuracy', description: 'Đánh giá khả năng sử dụng đa dạng các cấu trúc ngữ pháp và độ chính xác của chúng.' },
];

const mockCriteriaTask2 = [
  { id: '5', name: 'Task Response', description: 'Đánh giá việc trả lời đúng trọng tâm câu hỏi, phát triển các luận điểm đầy đủ và có lập trường rõ ràng.' },
  { id: '6', name: 'Coherence & Cohesion', description: 'Đánh giá tính logic trong việc trình bày bài luận, cách sử dụng liên từ và phân bổ đoạn văn hợp lý.' },
  { id: '7', name: 'Lexical Resource', description: 'Đánh giá khả năng sử dụng từ vựng chuyên sâu về chủ đề xã hội, các cụm từ (collocations) tự nhiên.' },
  { id: '8', name: 'Grammatical Range & Accuracy', description: 'Đánh giá việc sử dụng câu phức, câu ghép và hạn chế các lỗi ngữ pháp cơ bản.' },
];

const SaveIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const BoltIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const CriteriaManagement: React.FC = () => {
  const CriteriaCard = ({ title, data }: { title: string, data: any[] }) => (
      <div className="bg-[#0a0a0a] border border-[#27272a] rounded-xl overflow-hidden flex flex-col h-full shadow-[0_0_15px_rgba(0,0,0,0.5)]">
         {/* Card Header */}
         <div className="px-6 py-5 border-b border-[#27272a] bg-[#0f0f0f] flex items-center justify-between">
             <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-white"></div>
                 <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>
             </div>
             <button className="flex items-center gap-2 px-3 py-1.5 bg-[#18181b] border border-[#27272a] text-[#ededed] text-xs font-medium rounded-lg hover:border-[#3f3f46] hover:bg-[#27272a] transition-colors">
                 <SaveIcon /> Lưu thay đổi
             </button>
         </div>

         {/* Card Body */}
         <div className="p-6 flex-1 flex flex-col gap-6">
             {data.map((item) => (
                 <div key={item.id} className="group">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider group-focus-within:text-[#ededed] transition-colors">
                            {item.name}
                        </span>
                     </div>
                     <textarea 
                        defaultValue={item.description} 
                        rows={3} 
                        className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-4 py-3 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all resize-none shadow-inner"
                        placeholder={`Hướng dẫn AI chấm điểm ${item.name}...`}
                     />
                 </div>
             ))}
         </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-orange-500/30 selection:text-white pb-20">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {/* Page Header */}
        <div className="mb-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <BoltIcon />
            <span className="text-[#a1a1aa] font-bold text-[10px] uppercase tracking-[0.2em]">Prompt Engineering</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Cấu hình Tiêu chí chấm điểm</h1>
          <p className="text-[#71717a] text-sm leading-relaxed">
            Tinh chỉnh nội dung hướng dẫn (Instruction) cho AI của BandMates. Hệ thống sẽ bám sát những mô tả này để đưa ra điểm số và nhận xét chính xác cho từng tiêu chí đánh giá. Hành vi của AI sẽ thay đổi ngay lập tức sau khi lưu.
          </p>
        </div>

        {/* Main Grid */}
        <Row gutter={[24, 24]}>
          <Col xs={24} xl={12}>
            <CriteriaCard title="IELTS Writing Task 1" data={mockCriteriaTask1} />
          </Col>
          <Col xs={24} xl={12}>
            <CriteriaCard title="IELTS Writing Task 2" data={mockCriteriaTask2} />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CriteriaManagement;
