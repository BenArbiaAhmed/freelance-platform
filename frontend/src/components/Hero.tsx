import { ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const avatars = [
  'https://i.pravatar.cc/40?img=1',
  'https://i.pravatar.cc/40?img=2',
  'https://i.pravatar.cc/40?img=3',
  'https://i.pravatar.cc/40?img=4',
]

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        {/* Pill badge */}
        <Badge variant="default" className="gap-1.5 py-1.5 px-4 text-sm">
          <Star className="w-3.5 h-3.5 fill-primary text-primary" />
          Trusted by 12,000+ professionals worldwide
        </Badge>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08]">
          Hire top freelancers.{' '}
          <span className="text-primary">Get work done.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          FreelanceHub connects ambitious clients with elite freelancers across design,
          development, marketing and more — with real-time collaboration built in.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button size="xl" className="gap-2 shadow-lg shadow-primary/25">
            Post a mission
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="xl" variant="outline">
            Browse freelancers
          </Button>
        </div>

        {/* Social proof row */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex -space-x-2">
            {avatars.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
          <span>
            <strong className="text-foreground font-semibold">4.9/5</strong> from 3,200+ reviews
          </span>
        </div>

        {/* Hero visual */}
        <div className="w-full mt-4 rounded-2xl border border-border bg-gradient-to-b from-secondary to-white shadow-2xl shadow-black/5 overflow-hidden">
          <div className="h-8 bg-secondary border-b border-border flex items-center px-4 gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Active missions', value: '1,842', change: '+12% this week' },
              { label: 'Freelancers online', value: '5,391', change: '+8% this week' },
              { label: 'Paid out this month', value: '$2.4M', change: '+21% vs last month' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white border border-border p-5 text-left shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-emerald-600 mt-1">{stat.change}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
