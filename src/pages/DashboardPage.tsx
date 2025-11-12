export function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-8 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-white/60">Control Center</p>
            <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
          </div>
          <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20">
            New Report
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-10">
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-white/5">
            <p className="text-sm text-white/60">Active Projects</p>
            <p className="mt-4 text-4xl font-semibold">12</p>
            <p className="mt-2 text-xs text-emerald-400">+3 this week</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-white/5">
            <p className="text-sm text-white/60">Team Messages</p>
            <p className="mt-4 text-4xl font-semibold">248</p>
            <p className="mt-2 text-xs text-sky-400">+58 new replies</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-white/5">
            <p className="text-sm text-white/60">Completion Rate</p>
            <p className="mt-4 text-4xl font-semibold">87%</p>
            <p className="mt-2 text-xs text-amber-400">Up 5% this month</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-white/5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Team Activity</h2>
              <span className="text-xs uppercase tracking-wide text-white/40">Last 24h</span>
            </div>
            <div className="mt-6 grid gap-4">
              {["Design Review", "API Integration", "AI Prompting Session", "QA Regression"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 px-4 py-3"
                >
                  <span className="text-sm font-medium">{item}</span>
                  <span className="text-xs text-white/50">In Progress</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-white/5">
            <h2 className="text-lg font-medium">Upcoming Milestones</h2>
            <ul className="mt-6 space-y-4 text-sm text-white/70">
              <li>
                <p className="font-medium text-white">Week 5 Curriculum</p>
                <p className="text-xs text-white/50">Due Friday • Outline refinement</p>
              </li>
              <li>
                <p className="font-medium text-white">Stakeholder Review</p>
                <p className="text-xs text-white/50">Monday • Live feedback session</p>
              </li>
              <li>
                <p className="font-medium text-white">Launch Prep</p>
                <p className="text-xs text-white/50">Next Wednesday • Production checklist</p>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

