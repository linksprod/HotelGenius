import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, DollarSign, TrendingUp, Users, Calendar, Filter, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

// Mock Data removed for production
const MOCK_TIPS: any[] = [];

const DEPARTMENTS = {
  all: 'All Departments',
  housekeeping: 'Housekeeping',
  dining: 'Restaurant & Bar',
  spa: 'Spa & Wellness',
  concierge: 'Concierge'
};

const TippingManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredTips = MOCK_TIPS.filter(tip => {
    const matchesSearch = tip.guest.toLowerCase().includes(searchTerm.toLowerCase()) || tip.room.includes(searchTerm);
    const matchesTab = activeTab === 'all' || tip.dept === activeTab;
    return matchesSearch && matchesTab;
  });

  const totalAmount = filteredTips.reduce((sum, tip) => sum + tip.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 px-8 pt-8">
      {/* Header */}
      <AdminPageHeader
        title="Digital Tipping Console"
        description="Monitor and manage staff gratuities across all departments."
        icon={<DollarSign className="h-5 w-5 text-primary" />}
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Last 30 Days
            </Button>
            <Button className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Export Report
            </Button>
          </>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tips (Period)</p>
                <h3 className="text-3xl font-bold mt-2">${totalAmount}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +12.5%
              </span>
              <span className="text-muted-foreground ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <h3 className="text-3xl font-bold mt-2">{filteredTips.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +5.2%
              </span>
              <span className="text-muted-foreground ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Department</p>
                <h3 className="text-3xl font-bold mt-2 text-primary">Spa</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-muted-foreground">Accounts for 45% of total tips</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-border/60 shadow-sm">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="p-4 sm:px-6 pb-0 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <TabsList className="bg-muted/50 h-10">
                {Object.entries(DEPARTMENTS).map(([key, label]) => (
                  <TabsTrigger key={key} value={key} className="text-xs sm:text-sm px-4">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search guests or rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 bg-background"
                  />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/40">
                  <tr>
                    <th className="px-6 py-4 font-medium"><div className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></div></th>
                    <th className="px-6 py-4 font-medium">Guest</th>
                    <th className="px-6 py-4 font-medium">Room</th>
                    <th className="px-6 py-4 font-medium">Department</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Note</th>
                    <th className="px-6 py-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredTips.length > 0 ? (
                    filteredTips.map((tip) => (
                      <tr key={tip.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {new Date(tip.date).toLocaleDateString()} <span className="text-[10px] ml-1">{new Date(tip.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">{tip.guest}</td>
                        <td className="px-6 py-4 text-muted-foreground">#{tip.room}</td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="capitalize font-normal bg-primary/10 text-primary hover:bg-primary/20">
                            {tip.dept}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-bold text-foreground">${tip.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 max-w-[200px] truncate text-muted-foreground">
                          {tip.note || <span className="italic opacity-50">No note provided</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "capitalize font-medium",
                              tip.status === 'processed' ? "border-green-500/30 text-green-500 bg-green-500/10" : "border-amber-500/30 text-amber-500 bg-amber-500/10"
                            )}
                          >
                            {tip.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        No tips found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default TippingManager;
