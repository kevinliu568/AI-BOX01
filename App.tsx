
import React, { useState, useCallback } from 'react';
import { generateScript, regenerateDialogue } from './services/geminiService';
import type { ScriptData } from './types';
import TopicInput from './components/TopicInput';
import ScriptDisplay from './components/ScriptDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateScript = useCallback(async () => {
    if (!topic.trim()) {
      setError('請輸入一個主題。');
      return;
    }
    if (duration < 5) {
      setError('節目時長至少需要5分鐘。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setScriptData(null);

    try {
      const data = await generateScript(topic, duration);
      setScriptData(data);
    } catch (err) {
      setError(err instanceof Error ? `生成腳本時發生錯誤: ${err.message}` : '發生未知錯誤');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [topic, duration]);

  const handleRegenerateDialogue = useCallback(async () => {
    if (!scriptData) return;
  
    setIsRegenerating(true);
    setError(null);
  
    try {
      const newContent = await regenerateDialogue(scriptData.content);
      setScriptData(prevData => prevData ? { ...prevData, content: newContent } : null);
    } catch (err) {
      setError(err instanceof Error ? `生成對話選項時發生錯誤: ${err.message}` : '發生未知錯誤');
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  }, [scriptData]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-teal-600 mb-2">
            AI 健康醫療節目腳本生成器
          </h1>
          <p className="text-slate-500 text-lg">
            輸入一個主題，讓 Gemini 為您打造專業的訪談內容
          </p>
        </header>

        <main className="flex flex-col gap-8">
          <TopicInput
            topic={topic}
            setTopic={setTopic}
            duration={duration}
            setDuration={setDuration}
            onGenerate={handleGenerateScript}
            isLoading={isLoading}
          />

          {error && <ErrorMessage message={error} />}

          {isLoading && <LoadingSpinner />}

          {scriptData && !isLoading && (
            <ScriptDisplay 
              scriptData={scriptData}
              topic={topic}
              onRegenerate={handleRegenerateDialogue}
              isRegenerating={isRegenerating}
            />
          )}

          {!scriptData && !isLoading && !error && (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
                <p className="text-slate-500">請在上方輸入您感興趣的健康主題，然後點擊「生成腳本」按鈕。</p>
            </div>
          )}
        </main>
      </div>
      <footer className="w-full max-w-4xl mx-auto mt-12 text-center text-slate-400 text-sm">
        <p>由 Gemini API 提供技術支援。內容僅供參考，不構成專業醫療建議。</p>
      </footer>
    </div>
  );
};

export default App;
