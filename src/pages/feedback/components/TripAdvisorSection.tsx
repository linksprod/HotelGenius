
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Upload, Link as LinkIcon } from 'lucide-react';

const TripAdvisorSection = () => {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-foreground mb-4">Share on TripAdvisor</h2>
      <Card className="p-6 rounded-xl border-2 border-primary/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <ExternalLink className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Share your review on TripAdvisor</h3>
            <p className="text-muted-foreground">Let the world know about your experience</p>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg mb-6">
          <p className="text-sm text-foreground">
            Your opinion matters! By sharing your experience on TripAdvisor, you help other
            travelers make informed decisions. Plus, you'll earn 500 reward points that can be
            redeemed for hotel services.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 gap-2" onClick={() => window.open('https://www.tripadvisor.com/UserReview', '_blank')}>
            <Upload className="h-4 w-4" />
            Write a Review
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <LinkIcon className="h-4 w-4" />
            Link Existing Review
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TripAdvisorSection;
