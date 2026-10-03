import { notFound } from 'next/navigation'
import { adminRole } from '@/lib/server/admin'
import BackendBusy from '@/components/app/BackendBusy'
import AdminNav from '@/components/admin/AdminNav'

export const metadata = { title: { default: 'Admin', template: '%s · Admin' }, robots: { index: false } }

// Admin pages exist only for users in the backend's admin_users table; everyone else gets a 404.
// The (app) layout above has already made sure the user is signed in and onboarded.
// The panel covers the whole window (over the site header and footer) with its own sidebar.
export default async function AdminLayout({ children }) {
  const role = await adminRole()
  if (role === null) return <BackendBusy />
  if (!role) notFound()
  return (
    <div className="nebula fixed inset-0 z-[60] flex flex-col lg:flex-row">
      <AdminNav role={role} />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
      </div>
    </div>
  )
}
