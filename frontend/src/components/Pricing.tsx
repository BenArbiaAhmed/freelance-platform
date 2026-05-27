import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Starter',
    price: 0,
    period: 'Free forever',
    description: 'For individuals exploring the platform.',
    cta: 'Get started free',
    popular: false,
    features: [
      'Post up to 2 missions/month',
      'Access to freelancer search',
      'Basic messaging',
      'Standard support',
    ],
  },
  {
    name: 'Pro',
    price: 49,
    period: 'per month',
    description: 'For growing teams with regular hiring needs.',
    cta: 'Start free trial',
    popular: true,
    features: [
      'Unlimited missions',
      'Real-time SSE dashboard',
      'Priority freelancer matching',
      'Webhook integrations',
      'Milestone escrow payments',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: null,
    period: 'Custom pricing',
    description: 'For large organisations with advanced needs.',
    cta: 'Contact sales',
    popular: false,
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom contract templates',
      'SSO & advanced permissions',
      'Volume payment discounts',
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl font-bold text-foreground">Simple, transparent pricing</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            No hidden fees. No per-seat surprises. Just straightforward plans that scale with you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col gap-6 rounded-2xl p-8 border bg-card transition-shadow hover:shadow-lg',
                plan.popular
                  ? 'border-primary shadow-xl shadow-primary/10 ring-1 ring-primary'
                  : 'border-border'
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-sm">
                  Most popular
                </Badge>
              )}

              <div>
                <h3 className="font-semibold text-lg text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div className="flex items-end gap-1">
                {plan.price !== null ? (
                  <>
                    <span className="text-5xl font-black text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground text-sm mb-2">{plan.period}</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-foreground">{plan.period}</span>
                )}
              </div>

              <ul className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-auto"
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
