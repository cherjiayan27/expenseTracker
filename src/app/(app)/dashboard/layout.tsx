import { BottomNav } from "@/components/navigation/BottomNav";

export default function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <div className="pb-24 md:pb-0">
        {children}
        {modal}
      </div>
      <BottomNav />
    </>
  );
}

