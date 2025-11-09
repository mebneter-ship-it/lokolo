import SupplierNavigation from '@/components/SupplierNavigation';

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SupplierNavigation />
      {children}
    </>
  );
}
