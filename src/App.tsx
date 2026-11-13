import { ArrowRight, HeartPulse } from 'lucide-react'

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-rose-50 px-6 py-16 text-slate-900">
      <section className="w-full max-w-xl rounded-3xl border border-rose-100 bg-white p-8 shadow-sm sm:p-12">
        <div className="mb-8 flex size-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <HeartPulse aria-hidden="true" size={28} />
        </div>
        <p className="mb-3 text-sm font-semibold tracking-wide text-rose-600">
          SOMABUDDY
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Easy learning for kids
        </h1>
        <p className="mt-5 max-w-md text-lg leading-8 text-slate-600">
          Your space for mindful moments, gentle routines, and feeling your
          best.
        </p>
        <button
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 font-medium text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
          type="button"
        >
          Start here
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </section>
    </main>
  )
}

export default App
