import { ReactNode } from 'react';
import SupplierNavigation from '@/components/SupplierNavigation';

export default function SupplierLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SupplierNavigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}