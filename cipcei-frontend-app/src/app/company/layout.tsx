import CustomLayout from "@/components/ui/custom-layout"

export default function DashboardCompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomLayout type="company">
      {children}
    </CustomLayout>
  )
}