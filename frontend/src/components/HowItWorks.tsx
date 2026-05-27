import { FileText, Users, Handshake, CreditCard } from 'lucide-react'

const steps = [
  {
    icon: FileText,
    step: '01',
    title: 'Post your mission',
    description:
      'Describe your project, set your budget, and list the skills you need. It takes less than 5 minutes.',
  },
  {
    icon: Users,
    step: '02',
    title: 'Receive applications',
    description:
      'Qualified freelancers apply with tailored proposals. Browse profiles, portfolios, and reviews.',
  },
  {
    icon: Handshake,
    step: '03',
    title: 'Sign a contract',
    description:
      'Choose your freelancer and sign a digital contract. A private chat channel opens instantly.',
  },
  {
    icon: CreditCard,
    step: '04',
    title: 'Pay securely',
    description:
      'Release milestone payments only when you\'re satisfied. Funds are held safely until delivery.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl font-bold text-foreground">From idea to delivery in 4 steps</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            We handle contracts, payments, and real-time collaboration so you can focus on what matters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.step} className="relative flex flex-col gap-4 p-7 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow">
                {/* connector line */}
                {i < steps.length - 1 && (
                  <span className="hidden lg:block absolute top-10 left-full w-6 border-t-2 border-dashed border-border z-10" />
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-4xl font-black text-border select-none">{s.step}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
