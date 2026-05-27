import { Zap } from 'lucide-react'

const sections = [
  {
    title: 'Platform',
    links: ['How it works', 'Features', 'Pricing', 'Enterprise'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Reference', 'Blog', 'Changelog'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Press', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30 px-6 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand column */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <a href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
              <Zap className="w-4 h-4" />
            </span>
            FreelanceHub
          </a>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The modern platform for freelance collaboration — built on REST, GraphQL, WebSocket, and SSE.
          </p>
        </div>

        {/* Link columns */}
        {sections.map((s) => (
          <div key={s.title} className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">{s.title}</h4>
            {s.links.map((l) => (
              <a
                key={l}
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} FreelanceHub. All rights reserved.</p>
        <p>Made with care for the freelance community.</p>
      </div>
    </footer>
  )
}
