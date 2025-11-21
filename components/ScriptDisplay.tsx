
import React from 'react';
import type { ScriptData } from '../types';

interface ScriptDisplayProps {
  scriptData: ScriptData;
  topic: string;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

// An enhanced markdown to HTML converter for script formatting
const Markdown: React.FC<{ text: string }> = ({ text }) => {
  const html = text
    .split('\n')
    .map(line => {
      // Illustration prompt
      if (line.startsWith('【製作插圖提示詞】:')) {
        const promptText = line.substring('【製作插圖提示詞】:'.length).trim();
        return `
          <div class="my-6 p-4 bg-teal-50 border-l-4 border-teal-300 rounded-r-lg flex items-start gap-3 not-prose">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p class="font-semibold text-teal-800 !my-0">插圖建議</p>
              <p class="text-slate-700 !my-0">${promptText}</p>
            </div>
          </div>
        `;
      }

      // Time stamp: [00:00-00:00]
      const timeMatch = line.match(/^\[(\d{2}:\d{2}-\d{2}:\d{2})\]/);
      if (timeMatch) {
          const timeText = timeMatch[1];
          return `
              <div class="flex items-center gap-3 my-5">
                  <span class="inline-flex items-center gap-2 bg-slate-100 text-slate-600 font-mono text-sm px-3 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      ${timeText}
                  </span>
                  <div class="flex-grow h-px bg-slate-200"></div>
              </div>
          `;
      }

      // Speaker labels: 【主持人】 or 【專家】
      const speakerMatch = line.match(/^【(主持人|專家)】(.*)/);
      if (speakerMatch) {
          const speaker = speakerMatch[1];
          const dialogue = speakerMatch[2].trim();
          const isHost = speaker === '主持人';
          const icon = isHost 
              ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`;
          const colorClass = isHost ? 'text-sky-800' : 'text-emerald-800';

          return `
              <div class="flex items-start gap-4 my-4">
                  <div class="flex-shrink-0 w-24 flex items-center gap-2 mt-1">
                      ${icon}
                      <span class="font-bold ${colorClass}">${speaker}</span>
                  </div>
                  <p class="flex-grow !my-0 text-slate-700">${dialogue}</p>
              </div>
          `;
      }
      
      // Empty lines
      if (line.trim() === '') return '';

      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Titles
      if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
      if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
      if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
      // List items
      if (line.startsWith('* ')) return `<li>${line.substring(2)}</li>`;
      // Default paragraphs
      return `<p>${line}</p>`;
    })
    // Group list items
    .join('')
    .replace(/<\/li><li>/g, '</li><li>') 
    .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul><ul>/g, '');


  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ scriptData, topic, onRegenerate, isRegenerating }) => {
  const handleExport = () => {
    const safeTopic = topic.trim().replace(/[\\/?%*:|"<>]/g, '-');
    const fileName = safeTopic ? `${safeTopic}-腳本.md` : '健康節目腳本.md';
    const blob = new Blob([scriptData.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-200 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          匯出腳本
        </button>
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 font-semibold rounded-lg hover:bg-sky-200 transition-colors duration-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          {isRegenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              生成對話選項
            </>
          )}
        </button>
      </div>

      <div className="prose prose-slate max-w-none prose-h2:text-teal-700 prose-h2:border-b prose-h2:pb-2 prose-h3:text-teal-600 prose-strong:text-slate-800">
         <Markdown text={scriptData.content} />
      </div>

      {scriptData.sources && scriptData.sources.length > 0 && (
        <div className="mt-10 pt-6 border-t border-slate-200">
          <h3 className="text-xl font-bold text-slate-700 mb-4">參考資料來源</h3>
          <ul className="space-y-2">
            {scriptData.sources.map((source, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-800 hover:underline break-all"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ScriptDisplay;
