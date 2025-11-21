
import React from 'react';

interface TopicInputProps {
  topic: string;
  setTopic: (topic: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const TopicInput: React.FC<TopicInputProps> = ({ topic, setTopic, duration, setDuration, onGenerate, isLoading }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onGenerate();
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm py-4 -my-4">
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-white rounded-xl shadow-lg border border-slate-200">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例如：關於高血壓的預防與控制"
          className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
          disabled={isLoading}
        />
        <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="duration-input" className="text-slate-600 font-medium whitespace-nowrap">時長:</label>
            <input
                id="duration-input"
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
                min="5"
                step="5"
                className="w-full sm:w-24 px-4 py-3 text-lg text-center border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                disabled={isLoading}
            />
            <span className="text-slate-500">分鐘</span>
        </div>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto flex-shrink-0 px-8 py-3 bg-teal-600 text-white font-bold text-lg rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            '生成腳本'
          )}
        </button>
      </div>
    </div>
  );
};

export default TopicInput;