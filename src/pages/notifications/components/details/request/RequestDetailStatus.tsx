
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Loader2, XCircle, Pause } from 'lucide-react';

interface RequestDetailStatusProps {
  status: string;
}

export const RequestDetailStatus: React.FC<RequestDetailStatusProps> = ({ status }) => {
  const { t } = useTranslation();
  const isPending = status === 'pending';
  const isOnHold = status === 'on_hold';
  const isInProgress = status === 'in_progress';
  const isCompleted = status === 'completed';
  const isCancelled = status === 'cancelled';

  return (
    <div className="pt-4">
      {isPending && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">{t('notifications.requestStatus.pendingTitle')}</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{t('notifications.requestStatus.pendingDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isOnHold && (
        <div className="rounded-md bg-orange-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Pause className="h-5 w-5 text-orange-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">{t('notifications.requestStatus.onHoldTitle')}</h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>{t('notifications.requestStatus.onHoldDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isInProgress && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">{t('notifications.requestStatus.inProgressTitle')}</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>{t('notifications.requestStatus.inProgressDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isCompleted && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{t('notifications.requestStatus.completedTitle')}</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{t('notifications.requestStatus.completedDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isCancelled && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{t('notifications.requestStatus.cancelledTitle')}</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{t('notifications.requestStatus.cancelledDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
