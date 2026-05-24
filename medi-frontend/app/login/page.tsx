import { StaffLoginPage } from '@/components/admin/StaffLoginPage'

export const metadata = {
  title: 'Staff Sign In | MediQueue',
  description: 'Administrator and queue professional login for MediQueue hospital system.',
}

export default function LoginPage() {
  return <StaffLoginPage redirectTo="/admin" />
}
