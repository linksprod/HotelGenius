import React from 'react';
import { Card } from '@/components/ui/card';
import { User, Bot, ChevronRight } from 'lucide-react';

interface ChatListScreenProps {
  onSelectChat: (type: 'concierge' | 'safety_ai') => void;
  userInfo: {
    name: string;
    email?: string;
    roomNumber?: string;
  };
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  onSelectChat,
  userInfo
}) => {
  return (
    <div className="py-6 px-4 max-w-5xl mx-auto">
      {/* Selection Header */}
      <div className="bg-slate-50/80 border border-slate-100 rounded-2xl px-8 py-10 mb-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Connect with our team or AI assistant
        </p>
      </div>

      {/* Chat Options */}
      <div className="space-y-6">
        {/* Hotel Team Chat */}
        <Card
          className="cursor-pointer border-slate-100 hover:border-primary/30 hover:bg-slate-50/50 transition-all duration-300 group shadow-sm hover:shadow-md rounded-2xl overflow-hidden"
          onClick={() => onSelectChat('concierge')}
        >
          <div className="flex items-center gap-6 p-7">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <User className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-slate-800">Hotel Team</h3>
              <p className="text-slate-500 mt-1">
                Connect directly with our staff
              </p>
            </div>

            <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
        </Card>

        {/* AI Assistant Chat */}
        <Card
          className="cursor-pointer border-slate-100 hover:border-secondary/30 hover:bg-slate-50/50 transition-all duration-300 group shadow-sm hover:shadow-md rounded-2xl overflow-hidden"
          onClick={() => onSelectChat('safety_ai')}
        >
          <div className="flex items-center gap-6 p-7">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <Bot className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white"></div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-slate-800">AI Assistant</h3>
              <p className="text-slate-500 mt-1">
                Instant AI help, can escalate to staff
              </p>
            </div>

            <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-secondary transition-colors" />
          </div>
        </Card>
      </div>
    </div>
  );
};
