import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Search, MapPin, Clock, Edit2, Trash2, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useHotelActivities, HotelActivity } from '@/hooks/useHotelActivities';

// Animation configurations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } }
};

export default function ActivitiesManager() {
  const { hotelId, hotel } = useHotel();
  const {
    activities,
    isLoading,
    addActivity,
    updateActivity,
    deleteActivity
  } = useHotelActivities(hotelId);

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<HotelActivity | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open dialog for new activity
  const handleOpenAdd = () => {
    setSelectedActivity(null);
    setName('');
    setLocation('');
    setTime('');
    setIsDialogOpen(true);
  };

  // Open dialog for editing
  const handleOpenEdit = (activity: HotelActivity) => {
    setSelectedActivity(activity);
    setName(activity.name);
    setLocation(activity.location);
    setTime(activity.time);
    setIsDialogOpen(true);
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !time) return;

    setIsSubmitting(true);
    try {
      if (selectedActivity) {
        await updateActivity({
          id: selectedActivity.id,
          name,
          location,
          time
        });
      } else {
        await addActivity({
          name,
          location,
          time
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this activity of the day?')) {
      try {
        await deleteActivity(id);
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  // Filtered list
  const filteredActivities = activities.filter(activity =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.time.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col bg-background text-foreground min-h-screen">
      <motion.div
        className="p-8 pb-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Header */}
        <motion.div variants={cardVariants} className="mb-8">
          <AdminPageHeader
            title="Daily Activities"
            description={`Manage daily schedules, entertainment, and workshops for guests at ${hotel?.name || 'the hotel'}.`}
            icon={<Calendar className="h-5 w-5 text-primary" />}
            actions={
              <Button
                onClick={handleOpenAdd}
                className="h-10 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-semibold shadow-lg transition-all"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Activity
              </Button>
            }
          />
        </motion.div>

        {/* Filter / Search section */}
        <motion.div variants={cardVariants} className="mb-6 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by activity name, location..."
              className="pl-10 h-11 bg-card border-border dark:border-white/5 rounded-xl text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Loader State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
            <p className="text-sm text-muted-foreground font-mono">Loading hotel activities...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredActivities.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[40vh] border border-dashed border-border dark:border-white/5 rounded-[2rem] p-8 text-center bg-card/10 backdrop-blur-sm"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-1">No activities found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  {searchQuery 
                    ? "No activities match your search query. Try typing something else." 
                    : "Start by creating the first activity of the day for this hotel."}
                </p>
                {!searchQuery && (
                  <Button onClick={handleOpenAdd} size="sm" className="rounded-xl">
                    <Plus className="mr-2 h-4 w-4" /> Create Activity
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="grid-list"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
              >
                {filteredActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    variants={cardVariants}
                    layoutId={activity.id}
                    exit="exit"
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card className="h-full bg-card hover:bg-card/85 border border-border dark:border-white/[0.03] hover:border-primary/30 dark:hover:border-primary/20 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col justify-between">
                      <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="px-3 py-1 text-xs font-semibold tracking-wide text-primary bg-primary/10 rounded-full flex items-center gap-1.5 w-fit">
                              <Sparkles className="h-3 w-3" /> Active Today
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(activity)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(activity.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          
                          <h4 className="text-xl font-bold tracking-tight text-foreground line-clamp-2">
                            {activity.name}
                          </h4>
                        </div>

                        <div className="space-y-2 border-t border-border/50 dark:border-white/5 pt-3">
                          <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <MapPin className="h-4 w-4 text-primary/80 shrink-0" />
                            <span className="truncate">{activity.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <Clock className="h-4 w-4 text-primary/80 shrink-0" />
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-card border border-border dark:border-white/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {selectedActivity ? 'Edit Daily Activity' : 'Add Daily Activity'}
            </DialogTitle>
            <DialogDescription>
              Enter the details of the activity of the day. All text fields should be in English.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">
                Activity Name
              </label>
              <Input
                id="name"
                required
                placeholder="e.g. Yoga Session, Wine Tasting"
                className="bg-background border-border dark:border-white/5 rounded-xl h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-semibold text-foreground">
                Location / Location inside Hotel
              </label>
              <Input
                id="location"
                required
                placeholder="e.g. Poolside Deck, Garden, Wine Cellar"
                className="bg-background border-border dark:border-white/5 rounded-xl h-11"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-semibold text-foreground">
                Time (English schedule format)
              </label>
              <Input
                id="time"
                required
                placeholder="e.g. 10:00 AM - 11:30 AM, 18:00"
                className="bg-background border-border dark:border-white/5 rounded-xl h-11"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl border-border hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary text-primary-foreground font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  selectedActivity ? 'Update Activity' : 'Save Activity'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
