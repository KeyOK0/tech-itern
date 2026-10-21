
export default function MainMenu({ onLogin, onRegister }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090a0e] px-4 text-stone-200">
      <div className="w-full max-w-md border border-white/10 rounded-md bg-[#101015] p-8 shadow-2xl">
        <header className="mb-10 text-center">
          <p className="mb-4 text-xs tracking-[0.4em] text-amber-500">
            YOUR LEGEND BEGINS
          </p>

          <h1 className="font-serif text-5xl text-red-700 font-bold tracking-widest">
            ANGRY
            <span className="mt-3 block text-amber-500">
              ROGUE
            </span>
          </h1>

          <p className="mt-5 text-sm text-stone-500">
            Świat czeka na Twoją historię.
          </p>
        </header>

        <div className="space-y-4">
          <button
            onClick={onRegister}
            className="w-full border border-green-500/60 bg-green-600 rounded-md px-5 py-4 text-sm font-semibold uppercase tracking-widest transition hover:bg-emerald-500"
          >
            Stwórz konto
          </button>

          <button
            onClick={onLogin}
            className="w-full border border-stone-700 rounded-md px-5 py-4 text-sm font-semibold uppercase tracking-widest transition hover:border-amber-500 hover:text-amber-400"
          >
            Zaloguj się
          </button>
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-stone-600">
          Stwórz konto w celu rozpoczęcia swojej przygody
        </p>
      </div>
    </main>
  );
}
