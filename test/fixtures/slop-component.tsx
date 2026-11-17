import React from 'react';
import { Sparkles } from 'lucide-react';

export function SloppyAiHero() {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-2xl">
      <div className="border rounded-xl p-6 bg-white shadow-md animate-bounce">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-bold">Powered by AI Assistant</span>
        </div>
        <p className="mt-4 text-gray-700">
          Supercharge your workflow with next generation magical artificial intelligence automation tools!
        </p>
      </div>
    </div>
  );
}
