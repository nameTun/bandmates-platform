import React from 'react';
import type { Prompt } from '@/features/practice/services/practice.service';
import { Image } from 'antd';
import { formatPrompt } from '../../utils/practice.utils';

export interface BaseEditorProps {
  promptObj: Prompt;
  text: string;
  setText: (v: string) => void;
  isEnough: boolean;
  wordCount: number;
  minWords: number;
  reviewAttempt?: any;
}

const EditorTextarea: React.FC<BaseEditorProps> = ({
  text,
  setText,
  isEnough,
  wordCount,
  minWords,
  reviewAttempt
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[450px] flex-1 relative flex flex-col focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 transition-all">
    <div className="flex items-center gap-1 p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
      <div className="flex-1" />
      <span className={`text-[11px] px-3 font-bold uppercase tracking-wider transition-colors ${isEnough ? 'text-emerald-500' : 'text-slate-400'}`}>
        {wordCount} / {minWords}+ từ
        {isEnough && <span className="ml-1 text-base leading-none inline-block align-middle">✓</span>}
      </span>
    </div>
    <textarea
      value={text}
      readOnly={!!reviewAttempt}
      onChange={(e) => setText(e.target.value)}
      placeholder="Bắt đầu viết bài của bạn tại đây..."
      className="flex-1 w-full p-8 text-[15px] leading-relaxed text-slate-800 bg-white border-0 rounded-2xl shadow-sm focus:ring-0 resize-none outline-none"
    />
  </div>
);

const CommonPromptDisplay: React.FC<{ promptObj: Prompt }> = ({ promptObj }) => (
  <>
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
      Nội dung đề bài
    </h3>
    <p className="text-slate-800 font-semibold leading-relaxed text-[14px] whitespace-pre-wrap mb-4">{formatPrompt(promptObj.content)}</p>

    {promptObj.topic && (
      <div className="mt-4 flex gap-2">
        <span className="text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider text-slate-500 bg-slate-100 rounded-md">
          Topic: {promptObj.topic.name}
        </span>
      </div>
    )}
  </>
);

export const Task1AcademicEditor: React.FC<BaseEditorProps> = (props) => {
  const { promptObj } = props;
  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-6 items-start h-full">
      <div 
        className="lg:w-[45%] flex-shrink-0 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col resize overflow-auto"
        style={{ minWidth: '350px', maxWidth: '80vw', minHeight: '400px', maxHeight: '90vh' }}
      >
        <CommonPromptDisplay promptObj={promptObj} />
        {promptObj.imageUrl && (() => {
          const processedUrl = promptObj.imageUrl.includes('/upload/') 
            ? promptObj.imageUrl.replace('/upload/', '/upload/c_crop,h_0.85,w_0.85,g_center/e_trim:20/') 
            : promptObj.imageUrl;
            
          return (
            <div 
              className="mt-auto resize overflow-hidden bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl relative group flex flex-col justify-center items-center"
              style={{ minHeight: '150px', minWidth: '150px', height: '350px', width: '100%', maxWidth: '100%' }}
            >
              <div className="absolute inset-0 w-full h-full p-2">
                <Image
                  src={processedUrl}
                  alt="Prompt Image"
                  rootClassName="w-full h-full"
                  className="!w-full !h-full object-fill rounded-lg opacity-90 transition-opacity hover:opacity-100"
                  preview={{
                    mask: (
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-widest">Phóng to</span>
                      </div>
                    )
                  }}
                />
              </div>
            </div>
          );
        })()}
      </div>
      <div className="flex-1 flex flex-col gap-6">
        <EditorTextarea {...props} />
      </div>
    </div>
  );
};

export const Task1GeneralEditor: React.FC<BaseEditorProps> = (props) => {
  const { promptObj } = props;
  return (
    <div className="flex flex-col gap-6 mb-6">
      <div className="w-full bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100 shadow-sm flex flex-col">
        <CommonPromptDisplay promptObj={promptObj} />
      </div>
      <div className="flex-1 flex flex-col gap-6">
        <EditorTextarea {...props} />
      </div>
    </div>
  );
};

export const Task2Editor: React.FC<BaseEditorProps> = (props) => {
  const { promptObj } = props;
  return (
    <div className="flex flex-col gap-6 mb-6">
      <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        <CommonPromptDisplay promptObj={promptObj} />
      </div>
      <div className="flex-1 flex flex-col gap-6">
        <EditorTextarea {...props} />
      </div>
    </div>
  );
};
