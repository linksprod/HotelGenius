
import * as z from 'zod';

export const restaurantFormSchema = z.object({
  name: z.string().min(2, {
    message: "Restaurant name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  cuisine: z.string().min(2, {
    message: "Cuisine type is required.",
  }),
  openHours: z.string().min(2, {
    message: "Opening hours are required.",
  }),
  location: z.string().min(2, {
    message: "Location is required.",
  }),
  status: z.enum(['open', 'closed']),
  actionText: z.string().min(2, {
    message: "Action button text is required.",
  }).default("Book a Table"),
  isFeatured: z.boolean().default(false),
  bookingEnabled: z.boolean().default(true),
  images: z.array(z.string()).min(1, {
    message: "At least one image is required.",
  }),
});

export type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;
