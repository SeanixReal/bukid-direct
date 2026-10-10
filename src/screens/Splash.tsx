import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Hills } from '../components/ProduceArt'
import { HomeIndicator, StatusBar } from '../components/StatusBar'
import { brand } from '../data/sample'

export function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const id = window.setTimeout(() => navigate('/onboarding'), 2400)
    return () => window.clearTimeout(id)
  }, [navigate])

  return (
    <div
      className="bg-grad-brand relative flex h-full flex-col overflow-hidden"
      onClick={() => navigate('/onboarding')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate('/onboarding')}
    >
      {/* Soft leaf-green glow behind the mark */}
      <div className="pointer-events-none absolute left-1/2 top-[36%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary opacity-25 blur-3xl" />

      <StatusBar tone="light" />

      <div className="relative flex flex-1 flex-col items-center justify-center px-10 pb-28 text-center">
        <div className="animate-rise-in">
          <Logo size={112} className="text-on-dark" />
        </div>

        <h1
          className="animate-rise-in mt-7 whitespace-nowrap text-[52px] font-extrabold leading-none tracking-[-0.02em] text-on-dark"
          style={{ animationDelay: '120ms' }}
        >
          {brand.name}
        </h1>

        <p
          className="animate-rise-in mt-4 text-[19px] font-semibold text-on-dark-muted"
          style={{ animationDelay: '220ms' }}
        >
          {brand.tagline}
        </p>
      </div>

      <Hills className="animate-fade-in pointer-events-none absolute inset-x-0 bottom-0 h-[200px] w-full" />

      <div className="relative flex justify-center pb-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-[6px] w-[6px] rounded-full bg-on-dark"
              style={{
                opacity: 0.4,
                animation: `fade-in 700ms ease ${i * 200}ms infinite alternate`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative">
        <HomeIndicator tone="light" />
      </div>
    </div>
  )
}
