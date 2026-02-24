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
    <div className="py-4">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 rounded-2xl px-6 py-8 mb-6 mx-1 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-2">
          Connect with our team or AI assistant
        </p>
      </div>

      {/* Chat Options as Cards */}
      <div className="space-y-4 px-1">
        {/* Hotel Team Chat */}
        <Card
          className="cursor-pointer border-border hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 group shadow-sm hover:shadow-md"
          onClick={() => onSelectChat('concierge')}
        >
          <div className="flex items-center gap-4 p-5">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-accent rounded-full border-2 border-card"></div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground">Hotel Team</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Connect directly with our staff
              </p>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Card>

        {/* AI Assistant Chat */}
        <Card
          className="cursor-pointer border-border hover:border-secondary/50 hover:bg-muted/30 transition-all duration-200 group shadow-sm hover:shadow-md"
          onClick={() => onSelectChat('safety_ai')}
        >
          <div className="flex items-center gap-4 p-5">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/15 transition-colors">
                <Bot className="h-7 w-7 text-secondary" />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-secondary rounded-full border-2 border-card"></div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground">AI Assistant</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Instant AI help, can escalate to staff
              </p>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
          </div>
        </Card>
      </div>
    </div>
  );
};
