-- Enable delete policies for guests and staff on conversations
CREATE POLICY "Guests can delete their own conversations" 
ON public.conversations 
FOR DELETE 
USING (auth.uid() = guest_id);

CREATE POLICY "Staff can delete conversations" 
ON public.conversations 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Enable delete policies for guests and staff on messages
CREATE POLICY "Users can delete messages in their conversations" 
ON public.messages 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.guest_id = auth.uid() OR is_admin(auth.uid()))
  )
);

-- Enable delete policies for guests and staff on chat_routing
CREATE POLICY "Users can delete routing entries for their conversations" 
ON public.chat_routing 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = chat_routing.conversation_id 
    AND (conversations.guest_id = auth.uid() OR is_admin(auth.uid()))
  )
);
