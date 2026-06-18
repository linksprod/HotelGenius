import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter, RefreshCw, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import NotificationCard from "./components/NotificationCard";
import { useUnifiedCancellation } from "./hooks/useUnifiedCancellation";

const Requests = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, refetchServices, refetchReservations, refetchSpaBookings, refetchEventReservations } =
    useNotifications();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { isUpdating, isCancelDialogOpen, canCancelNotification, openCancelDialog, closeCancelDialog, handleCancel } =
    useUnifiedCancellation(refetchServices, refetchSpaBookings, refetchReservations, refetchEventReservations);

  const handleRefreshAll = () => {
    refetchServices();
    refetchReservations();
    refetchSpaBookings();
    refetchEventReservations();
  };

  // Filter notifications based on search term, status, and type
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;
    const matchesType = typeFilter === "all" || notification.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('notifications.back')}
          </Button>
          <h1 className="text-2xl font-bold">{t('notifications.myNotifications')}</h1>
          <Button variant="outline" onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('notifications.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('notifications.filterByType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('notifications.type.all', 'All Types')}</SelectItem>
              <SelectItem value="request">{t('notifications.type.request')}</SelectItem>
              <SelectItem value="spa_booking">{t('notifications.type.spa')}</SelectItem>
              <SelectItem value="reservation">{t('notifications.type.restaurant')}</SelectItem>
              <SelectItem value="event_reservation">{t('notifications.type.event')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('notifications.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('notifications.status.all', 'All Status')}</SelectItem>
              <SelectItem value="pending">{t('notifications.status.pending')}</SelectItem>
              <SelectItem value="confirmed">{t('notifications.status.confirmed')}</SelectItem>
              <SelectItem value="in_progress">{t('notifications.status.in_progress')}</SelectItem>
              <SelectItem value="completed">{t('notifications.status.completed')}</SelectItem>
              <SelectItem value="cancelled">{t('notifications.status.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {t('notifications.showingCount', { filtered: filteredNotifications.length, total: notifications.length })}
          </p>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={`${notification.type}-${notification.id}`}
                notification={notification}
                onCancel={openCancelDialog}
                canCancel={canCancelNotification(notification)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  {notifications.length === 0 ? t('notifications.noRequests') : t('notifications.noMatchingRequests')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {notifications.length === 0
                    ? t('notifications.noRequestsDesc')
                    : t('notifications.noMatchingRequestsDesc')}
                </p>
                {notifications.length === 0 && <Button onClick={() => navigate("/my-room")}>{t('notifications.goToMyRoom')}</Button>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={closeCancelDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('notifications.cancelDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('notifications.cancelDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={closeCancelDialog}>
              {t('notifications.cancelDialog.keep')}
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isUpdating}>
              {isUpdating ? t('notifications.cancelDialog.cancelling') : t('notifications.cancelDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Requests;
