
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RegistrationForm from './RegistrationForm';
import LoginForm from './LoginForm';

const LoginCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');

  return (
    <Card className="w-full max-w-md shadow-lg glass-card border-border/40">
      <CardHeader className="space-y-1">
        <h2 className="text-center text-4xl font-bold tracking-tight text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Stay Genius
        </h2>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {activeTab === 'login'
            ? 'Sign in to access your hotel services'
            : 'Create your account to access hotel services'}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegistrationForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LoginCard;
