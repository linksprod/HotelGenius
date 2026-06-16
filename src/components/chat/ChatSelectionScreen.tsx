import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Shield, Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChatSelectionScreenProps {
  onSelectChat: (type: 'concierge' | 'safety_ai') => void;
  userInfo: {
    name: string;
    email?: string;
    roomNumber?: string;
  };
}

export const ChatSelectionScreen: React.FC<ChatSelectionScreenProps> = ({
  onSelectChat,
  userInfo
}) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-4 py-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{t('chat.selectionScreen.messageCenter')}</h1>
          <p className="text-muted-foreground">
            {t('chat.selectionScreen.welcome', { name: userInfo.name })}
            {userInfo.roomNumber && t('chat.selectionScreen.room', { roomNumber: userInfo.roomNumber })}
          </p>
        </div>
      </div>

      {/* Chat Options */}
      <div className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Guest Services */}
        <div 
          className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => onSelectChat('concierge')}
        >
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">{t('chat.selectionScreen.guestServices')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('chat.selectionScreen.hotelAssistance')}
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{t('chat.selectionScreen.available247')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{t('chat.selectionScreen.aiAndHumanSupport')}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('chat.selectionScreen.generalServices')}
              </p>
            </div>
          </div>
        </div>

        {/* Safety Assistant */}
        <div 
          className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => onSelectChat('safety_ai')}
        >
          <div className="flex items-start space-x-4">
            <div className="bg-destructive/10 p-3 rounded-full">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">{t('chat.selectionScreen.safetyAssistant')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('chat.selectionScreen.emergencySafetySupport')}
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{t('chat.selectionScreen.immediateResponse')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{t('chat.selectionScreen.aiSafetyProtocols')}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('chat.selectionScreen.emergencyProcedures')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};