import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center rounded-3xl bg-primary px-8 py-20 shadow-2xl shadow-primary/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Ready to build something great?
        </h2>
        <p className="text-white/70 mt-5 text-lg max-w-xl mx-auto">
          Join thousands of companies and freelancers already collaborating on FreelanceHub.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Button
            size="xl"
            className="bg-white text-primary hover:bg-white/90 shadow-lg gap-2"
          >
            Post your first mission
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="xl"
            className="bg-transparent text-white border border-white/30 hover:bg-white/10"
            variant="outline"
          >
            Explore as freelancer
          </Button>
        </div>
      </div>
    </section>
  )
}
