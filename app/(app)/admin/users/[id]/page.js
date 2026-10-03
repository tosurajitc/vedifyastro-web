import AdminUserDetail from '@/components/admin/AdminUserDetail'

export const metadata = { title: 'User' }

export default function AdminUserPage({ params }) {
  return <AdminUserDetail userId={params.id} />
}
