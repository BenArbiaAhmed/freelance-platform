import { useState } from 'react'
import { Sidebar, type DashTab } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { OverviewTab } from '@/components/dashboard/OverviewTab'
import { MissionsTab } from '@/components/dashboard/MissionsTab'
import { FreelancersTab } from '@/components/dashboard/FreelancersTab'
import { ApplicationsTab } from '@/components/dashboard/ApplicationsTab'
import { ContractsTab } from '@/components/dashboard/ContractsTab'
import { ProfileTab } from '@/components/dashboard/ProfileTab'
import { ChatPopup } from '@/components/dashboard/ChatPopup'

const mockUser = {
  nom: 'Aisha Kamara',
  role: 'freelance' as 'freelance' | 'client',
  photo: 'https://i.pravatar.cc/40?img=47',
}

export default function DashboardPage() {
  const [tab, setTab] = useState<DashTab>('overview')
  const [collapsed, setCollapsed] = useState(false)
  const [role, setRole] = useState<'freelance' | 'client'>('freelance')

  // Detail selection — cleared when navigating to a different tab
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<string | null>(null)

  function navigate(nextTab: DashTab) {
    if (nextTab !== 'missions') setSelectedMissionId(null)
    if (nextTab !== 'freelancers') setSelectedFreelancerId(null)
    setTab(nextTab)
  }

  function openMission(id: string) {
    setSelectedMissionId(id)
    setTab('missions')
  }

  return (
    <div className="flex h-screen bg-secondary/30 overflow-hidden">
      <Sidebar
        active={tab}
        onNavigate={navigate}
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
          {tab === 'overview' && (
            <OverviewTab
              role={role}
              onNavigate={navigate}
              onSelectMission={openMission}
            />
          )}
          {tab === 'missions' && (
            <MissionsTab
              selectedId={selectedMissionId}
              onSelect={setSelectedMissionId}
              role={role}
            />
          )}
          {tab === 'freelancers' && (
            <FreelancersTab
              selectedId={selectedFreelancerId}
              onSelect={setSelectedFreelancerId}
            />
          )}
          {tab === 'applications' && <ApplicationsTab />}
          {tab === 'contracts' && <ContractsTab />}
          {tab === 'profile' && <ProfileTab role={role} />}
        </main>
      </div>

      <ChatPopup />
    </div>
  )
}
