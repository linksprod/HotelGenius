
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Story, Event } from '@/types/event';
import { useEvents } from '@/hooks/useEvents';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageUpload } from "@/components/ui/image-upload";
import { Upload, Link } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().min(1, 'Image is required'),
  category: z.enum(['event', 'promo']),
  is_active: z.boolean().default(true),
  eventId: z.string().nullable().optional(),
});

interface StoryFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (storyData: any) => Promise<void>;
  initialData?: Story | null;
}

export const StoryForm: React.FC<StoryFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      image: initialData?.image || '',
      category: initialData?.category || 'event',
      is_active: initialData?.is_active !== false,
      eventId: initialData?.eventId || null,
    },
  });
  const { events, loading: eventsLoading } = useEvents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url');

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description,
        image: initialData.image,
        category: initialData.category,
        is_active: initialData.is_active !== false,
        eventId: initialData.eventId || null,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        image: '',
        category: 'event',
        is_active: true,
        eventId: null,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      // Ensure eventId is null when "none" is selected
      const submissionData = {
        ...values,
        eventId: values.eventId === 'none' || !values.eventId ? null : values.eventId
      };
      
      await onSubmit(submissionData);
      if (onOpenChange) onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollArea className="h-[80vh] w-full rounded-md bg-card dark:bg-transparent">
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Story title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Story description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={imageUploadMode === 'url' ? 'default' : 'outline'}
                        onClick={() => setImageUploadMode('url')}
                        size="sm"
                      >
                        <Link className="h-4 w-4 mr-2" />
                        URL
                      </Button>
                      <Button
                        type="button"
                        variant={imageUploadMode === 'upload' ? 'default' : 'outline'}
                        onClick={() => setImageUploadMode('upload')}
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    
                    {imageUploadMode === 'url' ? (
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                    ) : (
                      <ImageUpload
                        id="story-image"
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full"
                      />
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="promo">Promotion</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associate with an event (optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No event</SelectItem>
                        {events.map((event: Event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Linking this story to an event will allow users to book directly
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border dark:border-white/5 p-4 bg-muted/30 dark:bg-white/5">
                  <div className="space-y-0.5">
                    <FormLabel className="font-bold">Active</FormLabel>
                    <FormDescription className="text-[10px] text-muted-foreground">
                      This story will be visible to users in the mobile app
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              {onOpenChange && (
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
};
