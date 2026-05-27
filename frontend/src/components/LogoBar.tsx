const companies = ['Stripe', 'Notion', 'Linear', 'Vercel', 'Figma', 'Supabase', 'Loom', 'Resend']

export function LogoBar() {
  return (
    <section className="py-14 border-y border-border bg-secondary/40">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground mb-8">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {companies.map((name) => (
            <span key={name} className="text-lg font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-default select-none">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
