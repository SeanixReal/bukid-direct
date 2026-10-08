import { useNavigate } from 'react-router-dom'
import { Check, Truck, Wallet } from 'lucide-react'
import { Screen, ScreenFooter, SectionTitle, TopBar } from '../components/Screen'
import { ProductPicture } from '../components/ProduceArt'
import { Avatar, Button, HarvestedBadge } from '../components/ui'
import { useApp } from '../state/AppState'
import { farmerShare, farmerView, getFarm, getHub, getProduct, peso } from '../data/sample'

/* --------------------------------------------------------------------------
   The other side of the marketplace: what Nong Romy sees. A harvest list for
   tomorrow's orders, where the crates go, and what he earns.
   -------------------------------------------------------------------------- */

export function Farmer() {
  const navigate = useNavigate()
  const { harvested, toggleHarvested, harvestAll, showToast } = useApp()
  const farm = getFarm(farmerView.farmId)

  const rows = farmerView.harvest.flatMap((h) => {
    const product = getProduct(h.productId)
    return product ? [{ ...h, product }] : []
  })
  const totalKg = rows.reduce((sum, r) => sum + r.kg, 0)
  const sales = rows.reduce((sum, r) => sum + r.kg * r.product.price, 0)
  const earnings = Math.round(sales * farmerShare)
  const weeks = [...farmerView.pastWeeks, { label: 'This wk', amount: earnings }]
  const top = Math.max(...weeks.map((w) => w.amount))
  const picked = rows.filter((r) => harvested.includes(r.productId)).length
  const allPicked = picked === rows.length

  return (
    <Screen
      tone="light"
      statusClass="bg-primary-deep"
      footer={
        <ScreenFooter>
          {allPicked ? (
            <Button variant="secondary" onClick={() => navigate('/shop')}>
              Back to the buyer app
            </Button>
          ) : (
            <Button
              onClick={() => {
                harvestAll(rows.map((r) => r.productId))
                showToast(`${totalKg} kg harvested and ready to pack`)
              }}
            >
              <Check size={19} strokeWidth={3} />
              Mark all as harvested
            </Button>
          )}
        </ScreenFooter>
      }
    >
      {/* ---------------- Header ---------------- */}
      <header className="bg-primary-deep pb-20">
        <TopBar
          tone="light"
          onBack={() => navigate('/account')}
          right={
            <span className="rounded-pill bg-on-dark/15 px-3 py-1.5 text-[12px] font-extrabold uppercase tracking-wide text-on-dark">
              Farmer view
            </span>
          }
        />
        <div className="flex items-center gap-4 px-5 pt-1">
          <Avatar initials={farm.initials} size={60} tone="onGreen" />
          <div className="min-w-0">
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-on-dark">
              {farm.call}
            </h1>
            <p className="truncate text-[15px] font-semibold text-on-dark-muted">{farm.place}</p>
          </div>
        </div>
      </header>

      <div className="relative -mt-14 px-5 pb-6">
        {/* ---------------- This week ---------------- */}
        <div className="grid grid-cols-3 gap-2.5">
          <Stat label="Orders" value={String(farmerView.orders)} />
          <Stat label="To harvest" value={`${totalKg} kg`} />
          <Stat label="You earn" value={peso(earnings)} strong />
        </div>

        {/* ---------------- Harvest list ---------------- */}
        <SectionTitle
          className="mt-6"
          action={
            <span className="text-[14px] font-bold text-ink-muted">
              {picked} of {rows.length} picked
            </span>
          }
        >
          Tomorrow's harvest
        </SectionTitle>
        <ul className="space-y-2.5">
          {rows.map((r) => {
            const done = harvested.includes(r.productId)
            return (
              <li key={r.productId}>
                <button
                  type="button"
                  onClick={() => toggleHarvested(r.productId)}
                  aria-pressed={done}
                  className={`tappable flex w-full items-center gap-3 rounded-card border p-3 text-left ${
                    done ? 'border-primary/30 bg-primary-soft' : 'border-line bg-card shadow-card'
                  }`}
                >
                  <ProductPicture product={r.product} className="h-14 w-14 shrink-0 rounded-md" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-bold text-ink">{r.product.name}</span>
                    <span className="tabular block text-[15px] font-extrabold text-primary">
                      {r.kg} kg
                    </span>
                  </span>
                  {done ? (
                    <HarvestedBadge size="sm" />
                  ) : (
                    <span className="flex h-9 shrink-0 items-center rounded-pill px-3.5 text-[13px] font-bold text-ink-muted ring-2 ring-inset ring-line">
                      Mark picked
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* ---------------- Drop-offs ---------------- */}
        <SectionTitle className="mt-7">Hub drop-offs</SectionTitle>
        <ul className="divide-y divide-line rounded-card border border-line bg-card px-4 shadow-card">
          {farmerView.dropOffs.map((d) => (
            <li key={d.hubId} className="flex items-center gap-3 py-3">
              <Truck size={18} strokeWidth={2.4} className="shrink-0 text-primary" />
              <span className="flex-1 text-[15px] font-bold text-ink">{getHub(d.hubId).name}</span>
              <span className="text-[14px] font-semibold text-ink-muted">
                {d.crates} crates
              </span>
              <span className="tabular w-[76px] text-right text-[14px] font-extrabold text-ink">
                {d.time}
              </span>
            </li>
          ))}
        </ul>

        {/* ---------------- Earnings ---------------- */}
        <SectionTitle className="mt-7">Earnings</SectionTitle>
        <div className="rounded-card border border-line bg-card p-4 shadow-card">
          <div className="flex h-[150px] items-end gap-2.5">
            {weeks.map((w, i) => {
              const now = i === weeks.length - 1
              return (
                <div key={w.label} className="flex h-full flex-1 flex-col items-center justify-end">
                  <span
                    className={`tabular mb-1 text-[11.5px] font-extrabold ${now ? 'text-primary' : 'text-ink-muted'}`}
                  >
                    {(w.amount / 1000).toFixed(1)}k
                  </span>
                  <span
                    className={`w-full origin-bottom rounded-t-[10px] ${now ? 'bg-primary' : 'bg-secondary/45'}`}
                    style={{
                      height: `${(w.amount / top) * 100}%`,
                      animation: `bar-grow 600ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms both`,
                    }}
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex gap-2.5 border-t border-line pt-2">
            {weeks.map((w, i) => (
              <span
                key={w.label}
                className={`flex-1 text-center text-[11.5px] font-bold ${
                  i === weeks.length - 1 ? 'text-primary' : 'text-ink-muted'
                }`}
              >
                {w.label}
              </span>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-ink-muted">
            <Wallet size={17} strokeWidth={2.4} className="text-primary" />
            {farmerView.payout}
          </p>
        </div>
      </div>
    </Screen>
  )
}

function Stat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-card border border-line bg-card px-3 py-3.5 shadow-card">
      <p className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">{label}</p>
      <p
        className={`tabular mt-1 text-[21px] font-extrabold leading-none tracking-tight ${
          strong ? 'text-primary' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
