import ConsumerNavigation from '@/components/ConsumerNavigation';

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ConsumerNavigation />
      {children}
    </>
  );
}
