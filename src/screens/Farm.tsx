import { Navigate, useParams } from 'react-router-dom'
import { CalendarDays, MapPin, Sunrise } from 'lucide-react'
import { Screen, SectionTitle, TopBar } from '../components/Screen'
import { Hills } from '../components/ProduceArt'
import { ProductCard } from '../components/ProductCard'
import { Avatar } from '../components/ui'
import { farms, products } from '../data/sample'

export function FarmScreen() {
  const { id } = useParams()
  const farm = farms.find((f) => f.id === id)
  if (!farm) return <Navigate to="/shop" replace />

  const grown = products.filter((p) => p.farmId === farm.id)

  return (
    <Screen tone="light" statusClass="bg-primary">
      {/* ---------------- Header over the hills ---------------- */}
      <header className="bg-grad-brand relative overflow-hidden pb-24">
        <Hills className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] w-full" />
        <TopBar tone="light" />
        <div className="relative flex items-center gap-4 px-5 pt-2">
          <Avatar initials={farm.initials} size={68} tone="onGreen" className="shadow-float" />
          <div className="min-w-0">
            <h1 className="text-[30px] font-extrabold leading-tight tracking-tight text-on-dark">
              {farm.call}
            </h1>
            <p className="text-[15px] font-semibold text-on-dark-muted">{farm.farmer}</p>
          </div>
        </div>
      </header>

      <div className="relative -mt-14 px-5 pb-6">
        <div className="rounded-card border border-line bg-card p-4 shadow-card">
          <ul className="space-y-2.5">
            <Fact Icon={MapPin}>{farm.place}</Fact>
            <Fact Icon={Sunrise}>{farm.harvests}</Fact>
            <Fact Icon={CalendarDays}>{farm.since}</Fact>
          </ul>
          <p className="mt-4 border-t border-line pt-4 text-[16px] font-medium leading-relaxed text-ink">
            {farm.story}
          </p>
        </div>

        <SectionTitle className="mt-7">From this farm</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {grown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </Screen>
  )
}

function Fact({ Icon, children }: { Icon: typeof MapPin; children: string }) {
  return (
    <li className="flex items-center gap-3 text-[15px] font-semibold text-ink">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon size={18} strokeWidth={2.4} />
      </span>
      {children}
    </li>
  )
}
