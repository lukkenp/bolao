import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  colorClass?: string;
}

export default function StatCard({ 
  title, 
  value, 
  description, 
  icon,
  colorClass 
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="p-2 rounded-lg">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
