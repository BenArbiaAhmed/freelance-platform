import { useState } from 'react'
import { Sidebar, type DashTab } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { OverviewTab } from '@/components/dashboard/OverviewTab'
import { MissionsTab } from '@/components/dashboard/MissionsTab'
import { FreelancersTab } from '@/components/dashboard/FreelancersTab'
import { ApplicationsTab } from '@/components/dashboard/ApplicationsTab'
import { ContractsTab } from '@/components/dashboard/ContractsTab'

const mockUser = {
  nom: 'Aisha Kamara',
  role: 'freelance' as 'freelance' | 'client',
  photo: 'https://i.pravatar.cc/40?img=47',
}

export default function DashboardPage() {
  const [tab, setTab] = useState<DashTab>('overview')
  const [collapsed, setCollapsed] = useState(false)
  const [role, setRole] = useState<'freelance' | 'client'>('freelance')

  return (
    <div className="flex h-screen bg-secondary/30 overflow-hidden">
      <Sidebar
        active={tab}
        onNavigate={setTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        user={{ ...mockUser, role }}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          tab={tab}
          role={role}
          onRoleToggle={() => setRole((r) => (r === 'freelance' ? 'client' : 'freelance'))}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {tab === 'overview' && <OverviewTab role={role} />}
          {tab === 'missions' && <MissionsTab />}
          {tab === 'freelancers' && <FreelancersTab />}
          {tab === 'applications' && <ApplicationsTab />}
          {tab === 'contracts' && <ContractsTab />}
        </main>
      </div>
    </div>
  )
}
