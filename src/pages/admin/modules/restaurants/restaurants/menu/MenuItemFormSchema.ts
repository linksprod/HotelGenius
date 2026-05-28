
import * as z from 'zod';

export const menuItemFormSchema = z.object({
  name: z.string().min(2, {
    message: "Menu item name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  category: z.string().min(2, {
    message: "Category is required.",
  }),
  image: z.string().optional(),
  isFeatured: z.boolean().default(false),
  status: z.enum(['available', 'unavailable']),
  menuPdf: z.string().optional(),
});

export type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;
