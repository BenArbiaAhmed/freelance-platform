import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    name: 'Sophie Laurent',
    role: 'CTO, Nexora',
    avatar: 'https://i.pravatar.cc/56?img=5',
    stars: 5,
    quote:
      'We hired three senior React developers in under a week. The real-time chat made feedback loops incredibly tight — felt like they were in the office.',
  },
  {
    name: 'James Okafor',
    role: 'Freelance UX Designer',
    avatar: 'https://i.pravatar.cc/56?img=12',
    stars: 5,
    quote:
      'Embark pays on time, every time. The milestone escrow means I never chase invoices anymore. Best platform I\'ve used in 6 years.',
  },
  {
    name: 'Maria Chen',
    role: 'Head of Product, Stackly',
    avatar: 'https://i.pravatar.cc/56?img=9',
    stars: 5,
    quote:
      'The webhook integrations saved us hours per week. Every signed contract auto-creates a Notion page and pings our Slack. Zero manual work.',
  },
  {
    name: 'Rayan Mansouri',
    role: 'Freelance Backend Engineer',
    avatar: 'https://i.pravatar.cc/56?img=15',
    stars: 5,
    quote:
      'The GraphQL search is a game-changer. Clients find exactly my profile because they can filter by stack, rate, and timezone simultaneously.',
  },
  {
    name: 'Laura Andersen',
    role: 'COO, Buildwise',
    avatar: 'https://i.pravatar.cc/56?img=20',
    stars: 5,
    quote:
      'The live dashboard kept our whole team in sync on project status without a single status meeting. Genuinely delightful product.',
  },
  {
    name: 'Thomas Petit',
    role: 'Freelance Data Engineer',
    avatar: 'https://i.pravatar.cc/56?img=8',
    stars: 5,
    quote:
      'Onboarding was seamless. Profile verified within an hour, first contract signed the same day. The platform is just fast.',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-4xl font-bold text-foreground">Loved by clients and freelancers</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Over 12,000 professionals trust Embark to power their work.
          </p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="break-inside-avoid hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
