
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

const FAQSection = () => {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="space-y-2">
        <AccordionItem value="item-1" className="border rounded-xl px-4 py-2 shadow-sm">
          <AccordionTrigger className="text-foreground font-semibold hover:no-underline">
            How do I request special accommodations?
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground pt-2 pb-3">
            You can request special accommodations by contacting our concierge service directly through the app or by visiting the front desk.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border rounded-xl px-4 py-2 shadow-sm">
          <AccordionTrigger className="text-foreground font-semibold hover:no-underline">
            What is the check-out process?
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground pt-2 pb-3">
            You can check out directly through the app, or visit the front desk. All room charges will be compiled and ready for review.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="border rounded-xl px-4 py-2 shadow-sm">
          <AccordionTrigger className="text-foreground font-semibold hover:no-underline">
            How can I extend my stay?
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground pt-2 pb-3">
            To extend your stay, please contact the front desk at least 24 hours before your scheduled check-out time to check availability.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FAQSection;
