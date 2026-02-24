
import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads a profile image to Supabase Storage and returns the public URL.
 * @param userId The ID of the user the image belongs to
 * @param base64Data The base64 encoded image data
 * @returns The public URL of the uploaded image
 */
export const uploadProfileImage = async (userId: string, base64Data: string): Promise<string | null> => {
    try {
        // 1. Convert Base64 to Blob
        const base64Content = base64Data.split(',')[1] || base64Data;
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/webp' });

        // 2. Define path: user_id/profile.webp
        const filePath = `${userId}/profile_${Date.now()}.webp`;

        // 3. Upload to Supabase Storage
        // Using 'avatars' as the bucket name - assuming it exists or will be created
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(filePath, blob, {
                contentType: 'image/webp',
                upsert: true
            });

        if (error) {
            console.error('Error uploading image to Supabase Storage:', error);
            return null;
        }

        // 4. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Exception in uploadProfileImage:', error);
        return null;
    }
};

/**
 * Deletes a profile image from Supabase Storage.
 * @param filePath The path of the file to delete
 */
export const deleteProfileImage = async (filePath: string): Promise<boolean> => {
    try {
        const { error } = await supabase.storage
            .from('avatars')
            .remove([filePath]);

        if (error) {
            console.error('Error deleting image from Supabase Storage:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Exception in deleteProfileImage:', error);
        return false;
    }
};
