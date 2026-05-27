import {
  MessageSquare, Bell, ShieldCheck, BarChart3,
  Zap, Globe,
} from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'Real-time messaging',
    description: 'Full-duplex WebSocket chat between clients and freelancers, with typing indicators and read receipts.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Bell,
    title: 'Live dashboards',
    description: 'Server-Sent Events push status changes, new bids, and payment confirmations without page reloads.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: ShieldCheck,
    title: 'Secure payments',
    description: 'Stripe-powered milestone escrow ensures funds are released only when deliverables are validated.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: BarChart3,
    title: 'Smart search',
    description: 'GraphQL-powered exploration lets clients filter freelancers by skill, rating, rate, and availability instantly.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Zap,
    title: 'Webhook integrations',
    description: 'Connect your CRM, Slack, or any tool. Events fire automatically on candidature, contract, and payment milestones.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Globe,
    title: 'Global talent pool',
    description: 'Access verified professionals across 80+ countries with multi-currency billing and localized tax handling.',
    color: 'bg-teal-50 text-teal-600',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Platform features</p>
          <h2 className="text-4xl font-bold text-foreground">Everything you need, nothing you don't</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Built on modern protocols — REST, GraphQL, WebSocket, SSE — so the platform stays fast and responsive at any scale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="group flex flex-col gap-4 p-7 rounded-2xl bg-card border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${f.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
