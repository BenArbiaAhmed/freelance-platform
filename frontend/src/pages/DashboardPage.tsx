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
import { useAuthStore } from '@/store/auth'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const role: 'freelance' | 'client' = user?.role === 'client' ? 'client' : 'freelance'
  const [tab, setTab] = useState<DashTab>('overview')
  const [collapsed, setCollapsed] = useState(false)

  // Detail selection — cleared when navigating to a different tab
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<string | null>(null)

  function navigate(nextTab: DashTab) {
    if (role === 'freelance' && nextTab === 'freelancers') return
    if (nextTab !== 'missions') setSelectedMissionId(null)
    if (nextTab !== 'freelancers') setSelectedFreelancerId(null)
    setTab(nextTab)
  }

  function openMission(id: string) {
    setSelectedMissionId(id)
    setTab('missions')
  }

  function openFreelancer(id: string) {
    setSelectedFreelancerId(id)
    setTab('freelancers')
  }

  return (
    <div className="flex h-screen bg-secondary/30 overflow-hidden">
      <Sidebar
        active={tab}
        onNavigate={navigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        user={{ nom: user?.nom ?? 'User', role, photo: user?.photo ?? undefined }}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader tab={tab} role={role} />

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
          {tab === 'applications' && (
            <ApplicationsTab role={role} onViewFreelancer={openFreelancer} />
          )}
          {tab === 'contracts' && <ContractsTab role={role} />}
          {tab === 'profile' && <ProfileTab role={role} />}
        </main>
      </div>

      <ChatPopup />
    </div>
  )
}
