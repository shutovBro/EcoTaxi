import { useState, useEffect, useRef, Component, type ReactNode } from "react";

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 20, background: "#0A1A12", color: "#A8FF3E", height: "100%", fontFamily: "monospace", fontSize: 12, wordBreak: "break-word" }}>
        <b>Error:</b> {this.state.error}
      </div>
    );
    return this.props.children;
  }
}

// ─── Logo SVG (EcoTaxi brand mark) ───────────────────────────────────────────
const EcoTaxiMark = ({ size = 64 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6DD628"/>
        <stop offset="100%" stopColor="#1A7A3A"/>
      </linearGradient>
    </defs>
    {/* Circle E */}
    <path d="M50 5 A45 45 0 1 1 49.9 5 Z" fill="none" stroke="url(#g1)" strokeWidth="10" strokeDasharray="210 283"/>
    {/* Leaf inside */}
    <path d="M44 38 C44 38 58 36 60 52 C60 52 46 58 38 50 C38 50 40 40 44 38 Z" fill="url(#g1)"/>
    <path d="M44 38 L56 52" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const EcoTaxiLogoFull = ({ dark = false }: { dark?: boolean }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
    <EcoTaxiMark size={72} />
    <div style={{ display: "flex", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
      <span style={{ color: dark ? "white" : "#0D1F0A" }}>Eco</span>
      <span style={{ color: "#5AB929" }}>Taxi</span>
    </div>
  </div>
);

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen =
  | "splash" | "onboarding" | "auth-phone" | "auth-otp" | "auth-name"
  | "home" | "search" | "route" | "ride-types" | "confirm" | "searching"
  | "driver-assigned" | "arrived" | "in-progress" | "completed"
  | "trips" | "trip-detail" | "eco" | "profile" | "payment" | "notifications" | "support";

type RideType = { id: string; name: string; arrival: string; price: string; co2: string; icon: string };

// ─── Constants ───────────────────────────────────────────────────────────────
const RIDE_TYPES: RideType[] = [
  { id: "eco",      name: "Eco",      arrival: "3 мин",  price: "850 ₸",  co2: "−42%",  icon: "🌿" },
  { id: "eco-plus", name: "Eco+",     arrival: "5 мин",  price: "1 200 ₸", co2: "−55%", icon: "⚡" },
  { id: "electric", name: "Electric", arrival: "8 мин",  price: "1 500 ₸", co2: "−100%", icon: "🔋" },
  { id: "comfort",  name: "Comfort",  arrival: "4 мин",  price: "1 900 ₸", co2: "−20%",  icon: "✨" },
];

const TRIPS = [
  { id: 1, date: "Сегодня, 14:23", from: "Проспект Абая, 52", to: "ТЦ Mega Silk Way", type: "Eco+", price: "1 200 ₸", co2: "1.2 кг", status: "completed" },
  { id: 2, date: "Вчера, 09:11",   from: "ЖК Нурлы Жол",      to: "БЦ Есиль",        type: "Electric", price: "1 500 ₸", co2: "2.1 кг", status: "completed" },
  { id: 3, date: "17 авг, 18:45",  from: "Аэропорт Нурсултан", to: "Гостиница Rixos",  type: "Comfort",  price: "3 800 ₸", co2: "0.8 кг", status: "completed" },
  { id: 4, date: "15 авг, 11:00",  from: "ул. Сейфуллина, 8",  to: "ЦПКиО",            type: "Eco",      price: "750 ₸",  co2: "1.5 кг", status: "completed" },
];

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconLeaf = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 3-8 3 1-2 2.5-3.5 5-4C17 2 5 5 3 14c0 0 1 3 4 5 0-3 3.5-6 10-11z"/>
  </svg>
);

const IconBolt = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
  </svg>
);

const IconHome = ({ active }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? "#0A6644" : "#9CA3AF"} className="w-6 h-6">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const IconClock = ({ active }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? "#0A6644" : "#9CA3AF"} className="w-6 h-6">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm.01 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>
);

const IconLeafNav = ({ active }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? "#0A6644" : "#9CA3AF"} className="w-6 h-6">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 3-8 3 1-2 2.5-3.5 5-4C17 2 5 5 3 14c0 0 1 3 4 5 0-3 3.5-6 10-11z"/>
  </svg>
);

const IconUser = ({ active }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? "#0A6644" : "#9CA3AF"} className="w-6 h-6">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const IconStar = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "none"} stroke={filled ? "none" : "#D1D5DB"} strokeWidth="2" className="w-6 h-6">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#111814" strokeWidth="2.5" strokeLinecap="round" className="w-6 h-6">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#6B7572" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const IconPin = ({ color = "#0A6644" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" fill={color} className="w-5 h-5">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const IconCar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
    <circle cx="7.5" cy="14.5" r="1.5"/>
    <circle cx="16.5" cy="14.5" r="1.5"/>
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#0A6644" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const IconCall = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
  </svg>
);

// ─── Map Component ────────────────────────────────────────────────────────────
const MapView = ({ dark = false, showRoute = false, showDriver = false }: { dark?: boolean; showRoute?: boolean; showDriver?: boolean }) => (
  <div className={`w-full h-full relative overflow-hidden ${dark ? "bg-[#0f1a14]" : "bg-[#e8f0eb]"}`}>
    {/* Grid roads */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 400" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="mapgrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill={dark ? "#111d16" : "#dce8df"}/>
          <rect x="24" y="0" width="12" height="60" fill={dark ? "#1a2e20" : "#c8dace"} opacity="0.8"/>
          <rect x="0" y="24" width="60" height="12" fill={dark ? "#1a2e20" : "#c8dace"} opacity="0.8"/>
        </pattern>
      </defs>
      <rect width="390" height="400" fill="url(#mapgrid)"/>

      {/* Main roads */}
      <rect x="0" y="155" width="390" height="18" fill={dark ? "#243028" : "#b8ccbc"} opacity="0.9"/>
      <rect x="155" y="0" width="18" height="400" fill={dark ? "#243028" : "#b8ccbc"} opacity="0.9"/>
      <rect x="0" y="285" width="390" height="14" fill={dark ? "#1e2820" : "#c0d4c4"} opacity="0.7"/>
      <rect x="255" y="0" width="14" height="400" fill={dark ? "#1e2820" : "#c0d4c4"} opacity="0.7"/>
      <rect x="55" y="0" width="14" height="400" fill={dark ? "#1e2820" : "#c0d4c4"} opacity="0.7"/>

      {/* Parks / blocks */}
      <rect x="80" y="40" width="60" height="100" rx="4" fill={dark ? "#162d1e" : "#b8d8be"} opacity="0.6"/>
      <rect x="200" y="80" width="40" height="60" rx="4" fill={dark ? "#162d1e" : "#b8d8be"} opacity="0.6"/>
      <rect x="280" y="170" width="80" height="100" rx="4" fill={dark ? "#162d1e" : "#b8d8be"} opacity="0.5"/>
      <rect x="20" y="200" width="120" height="70" rx="4" fill={dark ? "#1a2420" : "#c4d8c8"} opacity="0.4"/>

      {/* Route */}
      {showRoute && (
        <>
          <path d="M160 340 Q180 280 164 220 Q150 180 195 164 Q230 150 280 120"
            fill="none" stroke="#0A6644" strokeWidth="4" strokeDasharray="8 4" strokeLinecap="round" opacity="0.9"/>
          <circle cx="160" cy="340" r="8" fill="#0A6644"/>
          <circle cx="280" cy="120" r="8" fill="#A8FF3E"/>
        </>
      )}

      {/* Driver cars */}
      {showDriver && (
        <>
          <g transform="translate(200,190)">
            <circle cx="0" cy="0" r="16" fill="#0A6644" opacity="0.15"/>
            <circle cx="0" cy="0" r="8" fill="#0A6644"/>
          </g>
        </>
      )}

      {/* Nearby cars */}
      {!showRoute && !showDriver && (
        <>
          <g transform="translate(100,120)"><circle cx="0" cy="0" r="6" fill="#0A6644" opacity="0.7"/></g>
          <g transform="translate(220,200)"><circle cx="0" cy="0" r="6" fill="#0A6644" opacity="0.7"/></g>
          <g transform="translate(300,280)"><circle cx="0" cy="0" r="6" fill="#0A6644" opacity="0.7"/></g>
          <g transform="translate(60,300)"><circle cx="0" cy="0" r="6" fill="#0A6644" opacity="0.5"/></g>
        </>
      )}
    </svg>

    {/* Location pulse */}
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-10 h-10 rounded-full bg-[#0A6644] animate-pulse-ring opacity-30"/>
        <div className="absolute w-7 h-7 rounded-full bg-[#0A6644] animate-pulse-ring opacity-20" style={{ animationDelay: "0.5s" }}/>
        <div className="w-4 h-4 rounded-full bg-[#0A6644] border-2 border-white shadow-lg"/>
      </div>
    </div>
  </div>
);

// ─── Status Bar ───────────────────────────────────────────────────────────────
const StatusBar = ({ dark = false }: { dark?: boolean }) => (
  <div className={`flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-medium ${dark ? "text-white/70" : "text-[#111814]"}`}>
    <span>9:41</span>
    <div className="flex items-center gap-1">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
    </div>
  </div>
);

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
const BottomNav = ({ active, onNavigate }: { active: string; onNavigate: (s: Screen) => void }) => (
  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E2E8E4] pb-6 pt-2">
    <div className="flex items-center justify-around">
      {[
        { key: "home", label: "Главная", Icon: IconHome },
        { key: "trips", label: "Поездки", Icon: IconClock },
        { key: "eco", label: "Эко", Icon: IconLeafNav },
        { key: "profile", label: "Профиль", Icon: IconUser },
      ].map(({ key, label, Icon }) => (
        <button key={key} onClick={() => onNavigate(key as Screen)}
          className="flex flex-col items-center gap-1 px-4 py-1">
          <Icon active={active === key} />
          <span className={`text-[10px] font-medium ${active === key ? "text-[#0A6644]" : "text-gray-400"}`}>{label}</span>
        </button>
      ))}
    </div>
  </div>
);

// ─── Screens ──────────────────────────────────────────────────────────────────

const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0A1A12] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] rounded-full bg-[#0A6644]/20" style={{ filter: "blur(80px)" }}/>
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-[#A8FF3E]/5" style={{ filter: "blur(60px)" }}/>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative">
          <div className="w-36 h-36 rounded-3xl bg-white flex items-center justify-center shadow-2xl overflow-hidden">
            <EcoTaxiLogoFull />
          </div>
          <div className="absolute -inset-3 rounded-[36px] bg-[#5cca3c]/20 animate-pulse-ring"/>
        </div>
        <div className="text-center">
          <p className="text-[#A8FF3E] text-sm font-medium mt-1 tracking-widest uppercase">Поездки с пользой для будущего</p>
        </div>
      </div>
      <div className="absolute bottom-16 flex gap-1.5">
        {[0,1,2].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-[#A8FF3E]" : "bg-white/30"}`}/>)}
      </div>
    </div>
  );
};

const OnboardingScreen = ({ onDone }: { onDone: () => void }) => {
  const [step, setStep] = useState(0);
  const slides = [
    {
      emoji: "🗺️",
      color: "#0A6644",
      bg: "from-[#0A1A12] to-[#0A2A1A]",
      title: "Быстро найди поездку",
      text: "Умный алгоритм подберёт ближайшего водителя за секунды.",
    },
    {
      emoji: "🌿",
      color: "#1A9E6A",
      bg: "from-[#0A1A12] to-[#0A2A1A]",
      title: "Экологичный транспорт",
      text: "Только гибриды и электромобили. Меньше выбросов — чище воздух.",
    },
    {
      emoji: "📊",
      color: "#A8FF3E",
      bg: "from-[#0A1A12] to-[#0A2A1A]",
      title: "Следи за своим вкладом",
      text: "Каждая поездка экономит CO₂. Мы считаем — ты видишь результат.",
    },
  ];
  const s = slides[step];
  return (
    <div className={`flex flex-col h-full bg-gradient-to-b ${s.bg} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-[#0A6644]/10 rounded-full scale-150" style={{ filter: "blur(100px)", top: "20%" }}/>
      <StatusBar dark />
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        <div className="w-32 h-32 rounded-3xl flex items-center justify-center text-6xl shadow-2xl"
          style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
          {s.emoji}
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-white leading-tight">{s.title}</h2>
          <p className="text-white/60 text-sm leading-relaxed">{s.text}</p>
        </div>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-[#A8FF3E]" : "w-1.5 bg-white/20"}`}/>
          ))}
        </div>
      </div>
      <div className="px-6 pb-12 flex flex-col gap-3">
        <button onClick={() => step < 2 ? setStep(step + 1) : onDone()}
          className="w-full h-14 rounded-2xl bg-[#0A6644] text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform">
          {step < 2 ? "Далее" : "Начать"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        {step < 2 && (
          <button onClick={onDone} className="text-white/40 text-sm font-medium py-2">Пропустить</button>
        )}
      </div>
    </div>
  );
};

const AuthPhoneScreen = ({ onNext }: { onNext: () => void }) => {
  const [phone, setPhone] = useState("+7 ");
  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar />
      <div className="flex-1 flex flex-col px-6 pt-8">
        <div className="mb-8">
          <EcoTaxiLogoFull dark />
        </div>
        <h2 className="text-3xl font-bold text-[#111814] mb-2">Введите номер<br/>телефона</h2>
        <p className="text-[#6B7572] text-sm mb-10">Отправим SMS с кодом подтверждения</p>

        <div className="bg-[#F4F6F4] rounded-2xl p-4 flex items-center gap-3 mb-4">
          <div className="text-xl">🇰🇿</div>
          <div className="w-px h-6 bg-[#E2E8E4]"/>
          <input value={phone} onChange={e => setPhone(e.target.value)}
            className="flex-1 bg-transparent text-lg font-semibold text-[#111814] outline-none"
            placeholder="+7 700 000 0000" type="tel"/>
          <div className="text-[#0A6644]"><IconPhone /></div>
        </div>
        <p className="text-xs text-[#6B7572] mb-auto">Нажимая «Получить код», вы соглашаетесь с <span className="text-[#0A6644] font-medium">условиями использования</span></p>

        <button onClick={onNext}
          className="w-full h-14 rounded-2xl bg-[#0A6644] text-white font-semibold text-base mb-8 active:scale-95 transition-transform shadow-lg shadow-[#0A6644]/20">
          Получить код
        </button>
      </div>
    </div>
  );
};

const AuthOTPScreen = ({ onNext }: { onNext: () => void }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const refs = [ref0, ref1, ref2, ref3];
  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 3) refs[i + 1].current?.focus();
    if (next.every(v => v) && val) setTimeout(onNext, 300);
  };
  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar />
      <div className="flex items-center px-5 pt-3 pb-2">
        <button className="w-10 h-10 flex items-center justify-center"><IconArrowLeft /></button>
      </div>
      <div className="flex-1 flex flex-col px-6 pt-4">
        <h2 className="text-3xl font-bold text-[#111814] mb-2">Введите код</h2>
        <p className="text-[#6B7572] text-sm mb-10">Отправили SMS на <span className="text-[#111814] font-medium">+7 705 123 4567</span></p>
        <div className="flex gap-3 justify-center mb-8">
          {otp.map((v, i) => (
            <input key={i} ref={refs[i]} value={v} onChange={e => handleChange(i, e.target.value)}
              maxLength={1} type="tel"
              className={`w-16 h-16 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-colors
                ${v ? "border-[#0A6644] bg-[#0A6644]/5 text-[#0A6644]" : "border-[#E2E8E4] bg-[#F4F6F4] text-[#111814]"}`}/>
          ))}
        </div>
        <p className="text-center text-[#6B7572] text-sm">Не пришёл код? <span className="text-[#0A6644] font-medium">Отправить снова</span> (30 сек)</p>
        <div className="mt-auto pb-8">
          <button onClick={onNext} className="w-full h-14 rounded-2xl bg-[#0A6644] text-white font-semibold text-base active:scale-95 transition-transform shadow-lg shadow-[#0A6644]/20">
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
};

const AuthNameScreen = ({ onNext }: { onNext: () => void }) => {
  const [name, setName] = useState("");
  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar />
      <div className="flex-1 flex flex-col px-6 pt-10">
        <div className="w-20 h-20 rounded-full bg-[#F4F6F4] flex items-center justify-center text-3xl mb-6 self-center border-2 border-dashed border-[#E2E8E4]">
          👤
        </div>
        <h2 className="text-3xl font-bold text-[#111814] mb-2 text-center">Как вас зовут?</h2>
        <p className="text-[#6B7572] text-sm mb-10 text-center">Это имя увидит ваш водитель</p>
        <div className="bg-[#F4F6F4] rounded-2xl p-4 mb-4">
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-transparent text-lg font-semibold text-[#111814] outline-none"
            placeholder="Алибек Джаксыбеков"/>
        </div>
        <div className="mt-auto pb-8 space-y-3">
          <button onClick={onNext} disabled={!name.trim()}
            className={`w-full h-14 rounded-2xl font-semibold text-base active:scale-95 transition-all shadow-lg
              ${name.trim() ? "bg-[#0A6644] text-white shadow-[#0A6644]/20" : "bg-[#E2E8E4] text-[#6B7572]"}`}>
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
};

const HomeScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  const saved = [{ icon: "🏠", label: "Дом", addr: "ул. Шевченко, 14" }, { icon: "💼", label: "Работа", addr: "БЦ Байтерек" }, { icon: "⭐", label: "Mega", addr: "пр. Сарыарка" }];
  return (
    <div className="flex flex-col h-full bg-[#F4F6F4] relative">
      <div className="absolute inset-0 bottom-[220px]">
        <MapView />
        <StatusBar />
        <div className="absolute top-12 left-4 right-4 z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 bg-white rounded-2xl shadow-lg shadow-black/10 px-4 py-3 flex items-center gap-3"
              onClick={() => onNavigate("search")}>
              <IconSearch />
              <span className="text-[#6B7572] text-sm">Куда едем?</span>
            </div>
            <button className="w-11 h-11 bg-white rounded-xl shadow-lg flex items-center justify-center text-xl">🔔</button>
          </div>
        </div>
        <button className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center z-10 text-[#0A6644]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06z"/>
          </svg>
        </button>
      </div>

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl pb-20 z-10" style={{ maxHeight: "240px" }}>
        <div className="w-10 h-1 bg-[#E2E8E4] rounded-full mx-auto mt-3 mb-4"/>
        <div className="px-5">
          <p className="text-[10px] font-semibold text-[#6B7572] uppercase tracking-wider mb-3">Быстрые адреса</p>
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {saved.map((s, i) => (
              <button key={i} onClick={() => onNavigate("route")}
                className="flex items-center gap-2 bg-[#F4F6F4] rounded-xl px-3 py-2.5 shrink-0">
                <span className="text-lg">{s.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-[#111814]">{s.label}</p>
                  <p className="text-[10px] text-[#6B7572] truncate max-w-[80px]">{s.addr}</p>
                </div>
              </button>
            ))}
            <button className="flex items-center gap-2 bg-[#F4F6F4] rounded-xl px-3 py-2.5 shrink-0">
              <span className="text-lg">➕</span>
              <span className="text-xs font-medium text-[#6B7572]">Добавить</span>
            </button>
          </div>
          <button onClick={() => onNavigate("search")}
            className="w-full mt-3 h-12 rounded-2xl bg-[#0A6644] text-white font-semibold text-sm flex items-center justify-center gap-2">
            <span>Спланировать поездку</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
};

const SearchScreen = ({ onNavigate, onBack }: { onNavigate: (s: Screen) => void; onBack: () => void }) => {
  const [query, setQuery] = useState("");
  const recent = ["ТЦ Mega Silk Way", "БЦ Байтерек, ул. Кунаева", "Аэропорт Нурсултан", "ЦПКиО им. Президента", "Rixos Hotel Astana"];
  const filtered = query ? recent.filter(r => r.toLowerCase().includes(query.toLowerCase())) : recent;
  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pt-2 pb-3">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F4F6F4]">
          <IconArrowLeft />
        </button>
        <div className="flex-1 bg-[#F4F6F4] rounded-xl px-4 py-3 flex items-center gap-2">
          <IconSearch />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#111814] outline-none"
            placeholder="Куда едем?"/>
        </div>
      </div>

      {/* From */}
      <div className="px-4 py-3 border-b border-[#F4F6F4]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0A6644]/10 flex items-center justify-center"><span className="text-[#0A6644] text-sm">📍</span></div>
          <div>
            <p className="text-[10px] text-[#6B7572] font-medium">Откуда</p>
            <p className="text-sm font-semibold text-[#111814]">Ваше текущее местоположение</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <p className="px-4 pt-4 pb-2 text-[10px] font-semibold text-[#6B7572] uppercase tracking-wider">
          {query ? "Результаты" : "Недавние"}
        </p>
        {filtered.map((place, i) => (
          <button key={i} onClick={() => onNavigate("route")}
            className="w-full flex items-center gap-4 px-4 py-3 active:bg-[#F4F6F4] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#F4F6F4] flex items-center justify-center text-[#6B7572]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18z"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-[#111814]">{place}</p>
              <p className="text-[10px] text-[#6B7572]">Астана, Казахстан</p>
            </div>
            <span className="text-[#E2E8E4]">›</span>
          </button>
        ))}

        <div className="px-4 pt-2 pb-2">
          <p className="text-[10px] font-semibold text-[#6B7572] uppercase tracking-wider mb-3">Сохранённые</p>
          {[{ icon: "🏠", name: "Дом", addr: "ул. Шевченко, 14" }, { icon: "💼", name: "Работа", addr: "БЦ Байтерек" }].map((s, i) => (
            <button key={i} onClick={() => onNavigate("route")}
              className="w-full flex items-center gap-4 py-3 active:bg-[#F4F6F4] transition-colors border-b border-[#F4F6F4] last:border-0">
              <div className="w-10 h-10 rounded-xl bg-[#0A6644]/10 flex items-center justify-center text-xl">{s.icon}</div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#111814]">{s.name}</p>
                <p className="text-[10px] text-[#6B7572]">{s.addr}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const RouteScreen = ({ onNavigate, onBack }: { onNavigate: (s: Screen) => void; onBack: () => void }) => (
  <div className="flex flex-col h-full bg-[#F4F6F4]">
    <div className="absolute inset-0 bottom-[300px]">
      <MapView showRoute />
    </div>
    <StatusBar />
    <div className="absolute top-10 left-4 right-4 z-10">
      <button onClick={onBack} className="w-10 h-10 bg-white rounded-xl shadow flex items-center justify-center mb-3">
        <IconArrowLeft />
      </button>
    </div>

    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-10">
      <div className="w-10 h-1 bg-[#E2E8E4] rounded-full mx-auto mt-3"/>
      <div className="px-5 pt-4 pb-6">
        {/* Route points */}
        <div className="flex gap-3 mb-5">
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="w-3 h-3 rounded-full bg-[#0A6644]"/>
            <div className="w-0.5 h-8 bg-dashed border-l-2 border-dashed border-[#E2E8E4]"/>
            <div className="w-3 h-3 rounded-full bg-[#A8FF3E] border-2 border-[#0A6644]"/>
          </div>
          <div className="flex-1 space-y-4">
            <div className="bg-[#F4F6F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6B7572] mb-0.5">Откуда</p>
              <p className="text-sm font-semibold text-[#111814]">Проспект Абая, 52</p>
            </div>
            <div className="bg-[#F4F6F4] rounded-xl p-3">
              <p className="text-[10px] text-[#6B7572] mb-0.5">Куда</p>
              <p className="text-sm font-semibold text-[#111814]">ТЦ Mega Silk Way</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-5">
          {[{ label: "Расстояние", val: "8.4 км" }, { label: "Время", val: "~18 мин" }, { label: "Экономия CO₂", val: "−1.2 кг" }].map((s, i) => (
            <div key={i} className="flex-1 bg-[#F4F6F4] rounded-xl p-3 text-center">
              <p className="text-base font-bold text-[#111814]">{s.val}</p>
              <p className="text-[9px] text-[#6B7572] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <button onClick={() => onNavigate("ride-types")}
          className="w-full h-14 rounded-2xl bg-[#0A6644] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#0A6644]/20">
          Выбрать тариф
        </button>
      </div>
    </div>
  </div>
);

const RideTypesScreen = ({ onNavigate, onBack }: { onNavigate: (s: Screen) => void; onBack: () => void }) => {
  const [selected, setSelected] = useState("eco-plus");
  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar />
      <div className="flex items-center px-4 pt-2 pb-3">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F4F6F4]">
          <IconArrowLeft />
        </button>
        <h2 className="flex-1 text-center font-bold text-[#111814] text-lg">Выбор тарифа</h2>
        <div className="w-10"/>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {RIDE_TYPES.map(rt => (
          <button key={rt.id} onClick={() => setSelected(rt.id)}
            className={`w-full rounded-2xl p-4 text-left transition-all border-2 ${
              selected === rt.id
                ? "border-[#0A6644] bg-[#0A6644]/5"
                : "border-[#E2E8E4] bg-white"
            }`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                selected === rt.id ? "bg-[#0A6644]/10" : "bg-[#F4F6F4]"
              }`}>
                {rt.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-[#111814] text-base">{rt.name}</span>
                  {rt.id === "eco-plus" && (
                    <span className="text-[9px] font-bold bg-[#A8FF3E] text-[#111814] px-1.5 py-0.5 rounded-md">ХИТ</span>
                  )}
                  {rt.id === "electric" && (
                    <span className="text-[9px] font-bold bg-[#0A6644] text-white px-1.5 py-0.5 rounded-md">0% CO₂</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B7572]">
                  <span>🕐 {rt.arrival}</span>
                  <span>·</span>
                  <span className="text-[#0A6644] font-medium">{rt.co2} CO₂</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#111814] text-base">{rt.price}</p>
                {selected === rt.id && <div className="mt-1 flex justify-end"><div className="w-5 h-5 rounded-full bg-[#0A6644] flex items-center justify-center"><IconCheck /></div></div>}
              </div>
            </div>
          </button>
        ))}

        {/* Eco info card */}
        <div className="bg-gradient-to-br from-[#0A6644] to-[#1A9E6A] rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🌍</span>
            <p className="font-semibold text-sm">Эко-альтернатива</p>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            Выбирая Electric или Eco+, вы экономите до <strong className="text-[#A8FF3E]">55% выбросов CO₂</strong> по сравнению с обычным такси.
          </p>
        </div>
      </div>

      <div className="px-4 pb-8 pt-2 border-t border-[#F4F6F4]">
        <button onClick={() => onNavigate("confirm")}
          className="w-full h-14 rounded-2xl bg-[#0A6644] text-white font-semibold text-base shadow-lg shadow-[#0A6644]/20 active:scale-95 transition-transform">
          Продолжить
        </button>
      </div>
    </div>
  );
};

const ConfirmScreen = ({ onNavigate, onBack }: { onNavigate: (s: Screen) => void; onBack: () => void }) => (
  <div className="flex flex-col h-full bg-white">
    <StatusBar />
    <div className="flex items-center px-4 pt-2 pb-3">
      <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F4F6F4]">
        <IconArrowLeft />
      </button>
      <h2 className="flex-1 text-center font-bold text-[#111814] text-lg">Подтверждение</h2>
      <div className="w-10"/>
    </div>

    <div className="flex-1 overflow-y-auto px-4 space-y-3">
      {/* Route card */}
      <div className="bg-[#F4F6F4] rounded-2xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-1 w-2 h-2 rounded-full bg-[#0A6644] shrink-0"/>
          <div>
            <p className="text-[10px] text-[#6B7572]">Откуда</p>
            <p className="text-sm font-semibold text-[#111814]">Проспект Абая, 52</p>
          </div>
        </div>
        <div className="ml-1 border-l-2 border-dashed border-[#E2E8E4] h-4"/>
        <div className="flex items-start gap-3">
          <div className="mt-1 w-2 h-2 rounded-full bg-[#A8FF3E] border border-[#0A6644] shrink-0"/>
          <div>
            <p className="text-[10px] text-[#6B7572]">Куда</p>
            <p className="text-sm font-semibold text-[#111814]">ТЦ Mega Silk Way</p>
          </div>
        </div>
      </div>

      {/* Ride type */}
      <div className="bg-[#F4F6F4] rounded-2xl p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl">⚡</div>
        <div className="flex-1">
          <p className="font-semibold text-[#111814]">Eco+</p>
          <p className="text-xs text-[#6B7572]">−55% CO₂ · ~5 мин</p>
        </div>
        <p className="font-bold text-[#111814] text-lg">1 200 ₸</p>
      </div>

      {/* Payment */}
      <div className="bg-[#F4F6F4] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm text-[#111814]">Оплата</p>
          <button className="text-xs text-[#0A6644] font-medium">Изменить</button>
        </div>
        {[{ icon: "💳", label: "•••• 4242", sub: "Visa" }, { icon: "📱", label: "Apple Pay", sub: "" }].map((p, i) => (
          <div key={i} className={`flex items-center gap-3 py-2.5 ${i === 0 ? "border-b border-[#E2E8E4]" : ""}`}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl">{p.icon}</div>
            <div>
              <p className="text-sm font-medium text-[#111814]">{p.label}</p>
              {p.sub && <p className="text-xs text-[#6B7572]">{p.sub}</p>}
            </div>
            {i === 0 && <div className="ml-auto w-4 h-4 rounded-full bg-[#0A6644] flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white"/></div>}
          </div>
        ))}
      </div>

      {/* Promo */}
      <div className="bg-[#F4F6F4] rounded-2xl p-4 flex items-center gap-3">
        <span className="text-lg">🎟</span>
        <span className="text-sm text-[#6B7572] flex-1">Промокод или подарочная карта</span>
        <span className="text-[#0A6644] font-medium text-sm">+</span>
      </div>

      {/* Price breakdown */}
      <div className="bg-[#F4F6F4] rounded-2xl p-4 space-y-2">
        {[{ l: "Поездка", v: "1 200 ₸" }, { l: "Eco-бонус", v: "−50 ₸", green: true }, { l: "Итого", v: "1 150 ₸", bold: true }].map((r, i) => (
          <div key={i} className={`flex justify-between ${r.bold ? "border-t border-[#E2E8E4] pt-2 mt-1" : ""}`}>
            <span className={`text-sm ${r.bold ? "font-bold text-[#111814]" : "text-[#6B7572]"}`}>{r.l}</span>
            <span className={`text-sm font-semibold ${r.green ? "text-[#0A6644]" : r.bold ? "text-[#111814] font-bold" : "text-[#111814]"}`}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="px-4 pb-8 pt-3 border-t border-[#F4F6F4]">
      <button onClick={() => onNavigate("searching")}
        className="w-full h-14 rounded-2xl bg-[#0A6644] text-white font-bold text-base shadow-lg shadow-[#0A6644]/20 active:scale-95 transition-transform">
        Заказать поездку
      </button>
    </div>
  </div>
);

const SearchingScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  useEffect(() => { const t = setTimeout(() => onNavigate("driver-assigned"), 3000); return () => clearTimeout(t); }, [onNavigate]);
  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute inset-0"><MapView dark /></div>
      <StatusBar dark />
      <div className="absolute bottom-0 left-0 right-0 bg-[#0A1A12] rounded-t-3xl p-6 text-center">
        <div className="flex justify-center gap-2 mb-5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-3 h-3 rounded-full bg-[#0A6644] dot-bounce" style={{ animationDelay: `${i * 0.16}s` }}/>
          ))}
        </div>
        <h3 className="text-white font-bold text-xl mb-1">Ищем водителя</h3>
        <p className="text-white/50 text-sm mb-6">Подбираем ближайший Eco+ автомобиль…</p>
        <div className="flex gap-3 text-center mb-6">
          {[{ v: "8.4 км", l: "Расстояние" }, { v: "~18 мин", l: "Время" }, { v: "1 150 ₸", l: "Стоимость" }].map((s, i) => (
            <div key={i} className="flex-1 bg-white/5 rounded-xl p-3">
              <p className="text-white font-bold text-sm">{s.v}</p>
              <p className="text-white/40 text-[10px]">{s.l}</p>
            </div>
          ))}
        </div>
        <button onClick={() => onNavigate("home")}
          className="w-full h-12 rounded-2xl border border-white/20 text-white/60 font-medium text-sm">
          Отменить поиск
        </button>
      </div>
    </div>
  );
};

const DriverAssignedScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <div className="flex flex-col h-full relative">
    <div className="absolute inset-0 bottom-[360px]"><MapView showDriver /></div>
    <StatusBar />
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl">
      <div className="w-10 h-1 bg-[#E2E8E4] rounded-full mx-auto mt-3"/>
      <div className="px-5 pt-3 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-[#0A6644] font-semibold uppercase tracking-wider">Водитель назначен</p>
            <p className="font-bold text-[#111814] text-lg">Едет к вам · 4 мин</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A6644] to-[#1A9E6A] flex items-center justify-center text-white font-bold text-lg">АМ</div>
        </div>

        <div className="bg-[#F4F6F4] rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0A6644]/20 to-[#1A9E6A]/20 flex items-center justify-center text-2xl">👤</div>
            <div className="flex-1">
              <p className="font-bold text-[#111814]">Асет Мухамеджан</p>
              <div className="flex items-center gap-1 mt-0.5">
                {[1,2,3,4,5].map(i => <IconStar key={i} filled={i <= 4} />)}
                <span className="text-xs text-[#6B7572] ml-1">4.9</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {[{ icon: "🚗", val: "Tesla Model 3" }, { icon: "🎨", val: "Белый" }, { icon: "🔢", val: "A 777 AKM" }].map((i, idx) => (
              <div key={idx} className="flex-1 bg-white rounded-xl p-2 text-center">
                <p className="text-base mb-0.5">{i.icon}</p>
                <p className="text-[9px] font-semibold text-[#111814]">{i.val}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button className="flex-1 h-12 rounded-2xl bg-[#0A6644] flex items-center justify-center gap-2 text-white font-medium text-sm">
            <IconCall /> Позвонить
          </button>
          <button className="flex-1 h-12 rounded-2xl bg-[#F4F6F4] flex items-center justify-center gap-2 text-[#111814] font-medium text-sm">
            <div className="text-[#0A6644]"><IconChat /></div> Чат
          </button>
          <button className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center text-[#E53E3E] font-bold text-xs">SOS</button>
        </div>

        <button onClick={() => onNavigate("arrived")}
          className="w-full h-12 rounded-2xl bg-[#F4F6F4] text-[#6B7572] font-medium text-sm">
          Отменить поездку
        </button>
      </div>
    </div>
  </div>
);

const ArrivedScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <div className="flex flex-col h-full bg-white">
    <StatusBar />
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
      <div className="w-24 h-24 rounded-full bg-[#0A6644]/10 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[#0A6644] flex items-center justify-center text-3xl">🚗</div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#111814] mb-2">Водитель прибыл!</h2>
        <p className="text-[#6B7572] text-sm leading-relaxed">Tesla Model 3 · Белый · <span className="font-semibold text-[#111814]">A 777 AKM</span></p>
      </div>
      <div className="w-full bg-[#F4F6F4] rounded-2xl p-4 text-left space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">📍</span>
          <div><p className="text-[10px] text-[#6B7572]">Место посадки</p><p className="text-sm font-semibold text-[#111814]">Проспект Абая, 52</p></div>
        </div>
        <div className="border-t border-[#E2E8E4]"/>
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡</span>
          <div><p className="text-[10px] text-[#6B7572]">Безопасность</p><p className="text-sm font-semibold text-[#111814]">Проверьте номер авто перед посадкой</p></div>
        </div>
      </div>
      <div className="bg-[#A8FF3E]/20 border border-[#A8FF3E] rounded-2xl p-3 w-full">
        <p className="text-xs text-[#0A6644] font-medium text-center">🌿 Ваша Eco+ поездка сэкономит ~1.2 кг CO₂</p>
      </div>
    </div>
    <div className="px-5 pb-10">
      <button onClick={() => onNavigate("in-progress")}
        className="w-full h-14 rounded-2xl bg-[#0A6644] text-white font-bold text-base shadow-lg shadow-[#0A6644]/20">
        Начать поездку
      </button>
    </div>
  </div>
);

const InProgressScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <div className="flex flex-col h-full relative">
    <div className="absolute inset-0 bottom-[200px]"><MapView showRoute showDriver /></div>
    <StatusBar dark />

    {/* Top HUD */}
    <div className="absolute top-10 left-4 right-4 z-10">
      <div className="bg-[#0A1A12]/90 backdrop-blur rounded-2xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#A8FF3E] font-semibold uppercase tracking-wider">В поездке</p>
          <p className="text-white font-bold text-lg">Прибытие через 14 мин</p>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-[10px]">Осталось</p>
          <p className="text-white font-bold">6.2 км</p>
        </div>
      </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A6644] to-[#1A9E6A] flex items-center justify-center text-white font-bold">АМ</div>
        <div className="flex-1">
          <p className="font-bold text-[#111814]">Асет Мухамеджан</p>
          <p className="text-xs text-[#6B7572]">Tesla Model 3 · A 777 AKM</p>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-xl bg-[#0A6644] flex items-center justify-center"><IconCall /></button>
          <button className="w-10 h-10 rounded-xl bg-[#F4F6F4] flex items-center justify-center text-[#0A6644]"><IconChat /></button>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1 bg-[#F4F6F4] rounded-xl p-3 text-center">
          <p className="font-bold text-[#111814]">ТЦ Mega</p>
          <p className="text-[10px] text-[#6B7572]">Назначение</p>
        </div>
        <div className="flex-1 bg-[#F4F6F4] rounded-xl p-3 text-center">
          <p className="font-bold text-[#111814]">1 150 ₸</p>
          <p className="text-[10px] text-[#6B7572]">К оплате</p>
        </div>
        <button className="flex-1 bg-[#FEF2F2] rounded-xl p-3 text-center">
          <p className="font-bold text-[#E53E3E] text-sm">SOS</p>
          <p className="text-[10px] text-[#E53E3E]">Безопасность</p>
        </button>
      </div>
    </div>
  </div>
);

const CompletedScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState(0);
  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 space-y-4">
        {/* Header */}
        <div className="text-center pt-2">
          <div className="w-16 h-16 rounded-full bg-[#0A6644]/10 flex items-center justify-center mx-auto mb-3">
            <div className="w-10 h-10 rounded-full bg-[#0A6644] flex items-center justify-center"><IconCheck /></div>
          </div>
          <h2 className="text-2xl font-bold text-[#111814]">Поездка завершена</h2>
          <p className="text-[#6B7572] text-sm mt-1">Спасибо, что выбрали EcoTaxi 🌿</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[{ icon: "💰", val: "1 150 ₸", l: "Итого" }, { icon: "📍", val: "8.4 км", l: "Маршрут" }, { icon: "⏱", val: "17 мин", l: "Время" }].map((s, i) => (
            <div key={i} className="bg-[#F4F6F4] rounded-xl p-3 text-center">
              <p className="text-lg mb-1">{s.icon}</p>
              <p className="font-bold text-[#111814] text-sm">{s.val}</p>
              <p className="text-[9px] text-[#6B7572]">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Eco card */}
        <div className="bg-gradient-to-br from-[#0A6644] to-[#1A9E6A] rounded-2xl p-4 flex items-center gap-4">
          <div className="text-3xl">🌱</div>
          <div>
            <p className="text-white font-bold">−1.2 кг CO₂ сохранено</p>
            <p className="text-white/70 text-xs mt-0.5">Равно посадке 0.06 деревьев</p>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-[#F4F6F4] rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#111814] mb-3 text-center">Оцените поездку</p>
          <div className="flex justify-center gap-2 mb-3">
            {[1,2,3,4,5].map(i => (
              <button key={i} onClick={() => setRating(i)} className="w-10 h-10 transition-transform active:scale-110">
                <IconStar filled={i <= rating} />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <input className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-[#111814] outline-none border border-[#E2E8E4]"
              placeholder="Комментарий для водителя..."/>
          )}
        </div>

        {/* Tip */}
        <div className="bg-[#F4F6F4] rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#111814] mb-3">Чаевые водителю</p>
          <div className="flex gap-2">
            {[0, 100, 200, 300].map(t => (
              <button key={t} onClick={() => setTip(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  tip === t ? "bg-[#0A6644] text-white" : "bg-white text-[#6B7572] border border-[#E2E8E4]"
                }`}>
                {t === 0 ? "Нет" : `${t} ₸`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 pt-2 border-t border-[#F4F6F4]">
        <button onClick={() => onNavigate("home")}
          className="w-full h-14 rounded-2xl bg-[#0A6644] text-white font-bold text-base shadow-lg shadow-[#0A6644]/20">
          Готово
        </button>
      </div>
    </div>
  );
};

const EcoScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  const stats = [
    { label: "CO₂ сохранено", val: "24.6 кг", icon: "🌍", color: "#0A6644", sub: "в этом месяце" },
    { label: "Eco-поездок", val: "31", icon: "🚗", color: "#1A9E6A", sub: "всего" },
    { label: "Eco-рейтинг", val: "874", icon: "⭐", color: "#A8FF3E", sub: "из 1000" },
    { label: "Деревьев", val: "1.1", icon: "🌳", color: "#0A6644", sub: "эквивалент" },
  ];
  const months = ["Апр", "Май", "Июн", "Июл", "Авг"];
  const vals = [8, 14, 19, 22, 24.6];
  const max = Math.max(...vals);
  return (
    <div className="flex flex-col h-full bg-[#F4F6F4]">
      <StatusBar />
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0A1A12] to-[#0A6644] px-5 pb-8 pt-4">
          <h2 className="text-white font-bold text-xl mb-1">Эко-статистика</h2>
          <p className="text-white/60 text-xs">Ваш вклад в чистый воздух Астаны</p>
          <div className="mt-5 bg-white/10 rounded-2xl p-4">
            <p className="text-white/60 text-xs mb-1">Ваши поездки сохранили</p>
            <p className="text-3xl font-bold text-white">24.6 кг CO₂</p>
            <p className="text-[#A8FF3E] text-xs mt-1">↑ +3.2 кг по сравнению с прошлым месяцем</p>
          </div>
        </div>

        <div className="px-4 -mt-3 space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-[10px] text-[#6B7572]">{s.sub}</span>
                </div>
                <p className="text-2xl font-bold text-[#111814]">{s.val}</p>
                <p className="text-xs text-[#6B7572] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Monthly chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-semibold text-sm text-[#111814] mb-4">Динамика за 5 месяцев</p>
            <div className="flex items-end gap-2 h-24">
              {months.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg" style={{
                    height: `${(vals[i] / max) * 80}px`,
                    background: i === 4 ? "#0A6644" : "#0A6644",
                    opacity: i === 4 ? 1 : 0.2 + i * 0.18,
                  }}/>
                  <span className="text-[9px] text-[#6B7572]">{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm text-[#111814]">Eco-рейтинг</p>
              <span className="text-xs font-bold text-[#0A6644] bg-[#0A6644]/10 px-2 py-1 rounded-lg">874 / 1000</span>
            </div>
            <div className="h-3 bg-[#F4F6F4] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#0A6644] to-[#A8FF3E]" style={{ width: "87.4%" }}/>
            </div>
            <p className="text-xs text-[#6B7572] mt-2">До ранга «Eco Чемпион» осталось 126 баллов</p>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-semibold text-sm text-[#111814] mb-3">Достижения</p>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {[
                { icon: "🌱", label: "Эко-новичок", done: true },
                { icon: "⚡", label: "Электро-герой", done: true },
                { icon: "🌳", label: "Посадил дерево", done: true },
                { icon: "🏆", label: "Eco Чемпион", done: false },
                { icon: "🌍", label: "100 кг CO₂", done: false },
              ].map((b, i) => (
                <div key={i} className={`shrink-0 w-20 flex flex-col items-center p-2 rounded-xl text-center ${
                  b.done ? "bg-[#0A6644]/10" : "bg-[#F4F6F4] opacity-50"
                }`}>
                  <span className="text-2xl mb-1">{b.icon}</span>
                  <p className="text-[9px] font-medium text-[#111814] leading-tight">{b.label}</p>
                  {b.done && <div className="mt-1 w-3 h-3 rounded-full bg-[#0A6644] flex items-center justify-center">
                    <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" className="w-2 h-2"><path d="M2 6l3 3 5-5"/></svg>
                  </div>}
                </div>
              ))}
            </div>
          </div>

          {/* Equivalent */}
          <div className="bg-gradient-to-br from-[#0A6644] to-[#1A9E6A] rounded-2xl p-5">
            <p className="text-white font-bold mb-3">Это эквивалентно…</p>
            <div className="space-y-3">
              {[
                { icon: "🌳", text: "Посадке 1.1 деревьев" },
                { icon: "💡", text: "Экономии 45 часов LED-лампы" },
                { icon: "✈️", text: "2% от одного авиарейса Алматы–Астана" },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xl">{e.icon}</span>
                  <span className="text-white/90 text-sm">{e.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav active="eco" onNavigate={onNavigate} />
    </div>
  );
};

const TripsScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <div className="flex flex-col h-full bg-[#F4F6F4]">
    <StatusBar />
    <div className="px-5 pt-4 pb-3">
      <h2 className="text-2xl font-bold text-[#111814]">Мои поездки</h2>
      <div className="flex gap-2 mt-3">
        {["Все", "Eco+", "Electric", "Comfort"].map((f, i) => (
          <button key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            i === 0 ? "bg-[#0A6644] text-white" : "bg-white text-[#6B7572] border border-[#E2E8E4]"
          }`}>{f}</button>
        ))}
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-3">
      {TRIPS.map(trip => (
        <button key={trip.id} onClick={() => onNavigate("trip-detail")}
          className="w-full bg-white rounded-2xl p-4 text-left shadow-sm active:scale-[0.99] transition-transform">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] text-[#6B7572]">{trip.date}</p>
              <span className="text-[10px] font-bold text-[#0A6644] bg-[#0A6644]/10 px-2 py-0.5 rounded-md">{trip.type}</span>
            </div>
            <p className="font-bold text-[#111814]">{trip.price}</p>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col items-center gap-0.5 pt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0A6644]"/>
              <div className="w-px h-6 bg-[#E2E8E4]"/>
              <div className="w-1.5 h-1.5 rounded-full bg-[#A8FF3E] border border-[#0A6644]"/>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs text-[#111814] font-medium">{trip.from}</p>
              <p className="text-xs text-[#111814] font-medium">{trip.to}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[#F4F6F4]">
            <span className="text-xs text-[#0A6644]">🌿</span>
            <span className="text-xs text-[#0A6644] font-medium">−{trip.co2} CO₂ сохранено</span>
          </div>
        </button>
      ))}
    </div>
    <BottomNav active="trips" onNavigate={onNavigate} />
  </div>
);

const TripDetailScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col h-full bg-[#F4F6F4]">
    <StatusBar />
    <div className="flex items-center px-4 pt-2 pb-3">
      <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm">
        <IconArrowLeft />
      </button>
      <h2 className="flex-1 text-center font-bold text-[#111814]">Детали поездки</h2>
      <div className="w-10"/>
    </div>
    <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
      <div className="h-36 rounded-2xl overflow-hidden bg-white shadow-sm relative">
        <MapView showRoute />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/40"/>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-[#6B7572] uppercase tracking-wider">Сегодня, 14:23</p>
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-0.5 pt-1">
            <div className="w-2 h-2 rounded-full bg-[#0A6644]"/>
            <div className="w-px h-8 bg-[#E2E8E4]"/>
            <div className="w-2 h-2 rounded-full bg-[#A8FF3E] border border-[#0A6644]"/>
          </div>
          <div className="flex-1 space-y-3">
            <div><p className="text-[10px] text-[#6B7572]">Откуда</p><p className="text-sm font-semibold">Проспект Абая, 52</p></div>
            <div><p className="text-[10px] text-[#6B7572]">Куда</p><p className="text-sm font-semibold">ТЦ Mega Silk Way</p></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F4F6F4]">
          {[{ l: "Расстояние", v: "8.4 км" }, { l: "Время", v: "17 мин" }, { l: "Тариф", v: "Eco+" }].map((s, i) => (
            <div key={i} className="text-center"><p className="text-sm font-bold text-[#111814]">{s.v}</p><p className="text-[9px] text-[#6B7572]">{s.l}</p></div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-[#6B7572] uppercase tracking-wider mb-3">Водитель</p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A6644] to-[#1A9E6A] flex items-center justify-center text-white font-bold">АМ</div>
          <div className="flex-1">
            <p className="font-semibold text-[#111814]">Асет Мухамеджан</p>
            <div className="flex items-center gap-1"><IconStar filled /><span className="text-xs text-[#6B7572]">4.9 · Tesla Model 3</span></div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between mb-3">
          <p className="text-xs font-semibold text-[#6B7572] uppercase tracking-wider">Оплата</p>
          <span className="font-bold text-[#111814]">1 150 ₸</span>
        </div>
        {[{ l: "Поездка", v: "1 200 ₸" }, { l: "Eco-бонус", v: "−50 ₸", green: true }, { l: "Способ", v: "•••• 4242" }].map((r, i) => (
          <div key={i} className="flex justify-between py-1.5 border-b border-[#F4F6F4] last:border-0">
            <span className="text-sm text-[#6B7572]">{r.l}</span>
            <span className={`text-sm font-medium ${r.green ? "text-[#0A6644]" : "text-[#111814]"}`}>{r.v}</span>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-br from-[#0A6644] to-[#1A9E6A] rounded-2xl p-4 flex items-center gap-4">
        <span className="text-3xl">🌱</span>
        <div>
          <p className="text-white font-bold">−1.2 кг CO₂ сохранено</p>
          <p className="text-white/70 text-xs">Равно посадке 0.06 деревьев</p>
        </div>
      </div>
    </div>
  </div>
);

const ProfileScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <div className="flex flex-col h-full bg-[#F4F6F4]">
    <StatusBar />
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A1A12] to-[#0A6644] px-5 pt-4 pb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30">АД</div>
          <div>
            <h2 className="text-white font-bold text-xl">Алибек Джаксыбеков</h2>
            <p className="text-white/60 text-sm">+7 705 123 4567</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[#A8FF3E] text-xs font-bold">⭐ Eco-рейтинг 874</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2">
          {[{ val: "31", l: "Поездок" }, { val: "24.6 кг", l: "CO₂ сохранено" }, { val: "35 350 ₸", l: "Потрачено" }].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 text-center shadow-sm">
              <p className="font-bold text-[#111814] text-sm">{s.val}</p>
              <p className="text-[9px] text-[#6B7572]">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Menu sections */}
        {[
          {
            title: "Аккаунт",
            items: [
              { icon: "💳", label: "Способы оплаты", screen: "payment" as Screen },
              { icon: "🔔", label: "Уведомления", screen: "notifications" as Screen },
              { icon: "🛡", label: "Безопасность", screen: "profile" as Screen },
            ]
          },
          {
            title: "Поддержка",
            items: [
              { icon: "❓", label: "Помощь и FAQ", screen: "support" as Screen },
              { icon: "📦", label: "Потерянный предмет", screen: "support" as Screen },
              { icon: "💬", label: "Написать в поддержку", screen: "support" as Screen },
            ]
          },
          {
            title: "Приложение",
            items: [
              { icon: "🌿", label: "О программе EcoTaxi", screen: "eco" as Screen },
              { icon: "⚙️", label: "Настройки", screen: "profile" as Screen },
            ]
          }
        ].map((section, si) => (
          <div key={si} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <p className="text-[10px] font-semibold text-[#6B7572] uppercase tracking-wider px-4 pt-3 pb-1">{section.title}</p>
            {section.items.map((item, ii) => (
              <button key={ii} onClick={() => onNavigate(item.screen)}
                className="w-full flex items-center gap-3 px-4 py-3 border-t border-[#F4F6F4] first:border-0 active:bg-[#F4F6F4] transition-colors">
                <span className="text-lg w-7 text-center">{item.icon}</span>
                <span className="flex-1 text-sm font-medium text-[#111814] text-left">{item.label}</span>
                <span className="text-[#6B7572] text-lg">›</span>
              </button>
            ))}
          </div>
        ))}

        <button className="w-full bg-white rounded-2xl p-4 text-center text-[#E53E3E] font-medium text-sm shadow-sm">
          Выйти из аккаунта
        </button>
        <p className="text-center text-[10px] text-[#6B7572] pb-2">EcoTaxi v2.4.1 · Астана, Казахстан</p>
      </div>
    </div>
    <BottomNav active="profile" onNavigate={onNavigate} />
  </div>
);

const PaymentScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col h-full bg-[#F4F6F4]">
    <StatusBar />
    <div className="flex items-center px-4 pt-2 pb-3">
      <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm"><IconArrowLeft /></button>
      <h2 className="flex-1 text-center font-bold text-[#111814]">Способы оплаты</h2>
      <div className="w-10"/>
    </div>
    <div className="flex-1 px-4 space-y-3 overflow-y-auto pb-4">
      {[
        { icon: "💳", name: "•••• 4242", sub: "Visa · Основная", default: true, color: "#1a1a2e" },
        { icon: "💳", name: "•••• 7890", sub: "Mastercard", default: false, color: "#2d1a1a" },
        { icon: "📱", name: "Apple Pay", sub: "Касанием", default: false, color: "#1a1a1a" },
        { icon: "📲", name: "Google Pay", sub: "Касанием", default: false, color: "#1a2d1a" },
      ].map((p, i) => (
        <div key={i} className={`bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm ${p.default ? "border-2 border-[#0A6644]" : ""}`}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: p.color }}>{p.icon}</div>
          <div className="flex-1">
            <p className="font-semibold text-[#111814]">{p.name}</p>
            <p className="text-xs text-[#6B7572]">{p.sub}</p>
          </div>
          {p.default && <span className="text-[10px] font-bold text-[#0A6644] bg-[#0A6644]/10 px-2 py-1 rounded-lg">По умолчанию</span>}
        </div>
      ))}
      <button className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border-2 border-dashed border-[#E2E8E4]">
        <div className="w-12 h-12 rounded-xl bg-[#F4F6F4] flex items-center justify-center text-[#0A6644] text-2xl">+</div>
        <p className="font-medium text-[#0A6644]">Добавить карту</p>
      </button>
    </div>
  </div>
);

const NotificationsScreen = ({ onBack }: { onBack: () => void }) => {
  const notifs = [
    { icon: "🚗", title: "Водитель назначен", text: "Асет едет к вам · Tesla Model 3", time: "Только что", green: true },
    { icon: "🌿", title: "Eco-достижение!", text: "Вы накопили 24 кг CO₂ сэкономленных. Новый бейдж!", time: "2 часа назад", green: true },
    { icon: "🎁", title: "Специальное предложение", text: "−20% на Eco+ поездки сегодня до 22:00", time: "5 часов назад", green: false },
    { icon: "⭐", title: "Оцените поездку", text: "Поездка с Асетом завершена. Оцените водителя.", time: "Вчера", green: false },
    { icon: "💳", title: "Оплата прошла", text: "1 150 ₸ списано с карты •••• 4242", time: "Вчера", green: false },
  ];
  return (
    <div className="flex flex-col h-full bg-[#F4F6F4]">
      <StatusBar />
      <div className="flex items-center px-4 pt-2 pb-3">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm"><IconArrowLeft /></button>
        <h2 className="flex-1 text-center font-bold text-[#111814]">Уведомления</h2>
        <button className="text-xs text-[#0A6644] font-medium px-2">Все прочитаны</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        {notifs.map((n, i) => (
          <div key={i} className={`bg-white rounded-2xl p-4 flex gap-3 shadow-sm ${i === 0 ? "border-l-4 border-[#0A6644]" : ""}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${n.green ? "bg-[#0A6644]/10" : "bg-[#F4F6F4]"}`}>{n.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#111814]">{n.title}</p>
              <p className="text-xs text-[#6B7572] mt-0.5">{n.text}</p>
              <p className="text-[10px] text-[#6B7572] mt-1.5">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SupportScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="flex flex-col h-full bg-[#F4F6F4]">
    <StatusBar />
    <div className="flex items-center px-4 pt-2 pb-3">
      <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm"><IconArrowLeft /></button>
      <h2 className="flex-1 text-center font-bold text-[#111814]">Помощь</h2>
      <div className="w-10"/>
    </div>
    <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
      <div className="bg-[#0A6644] rounded-2xl p-4 flex items-center gap-3">
        <span className="text-2xl">💬</span>
        <div className="flex-1">
          <p className="text-white font-semibold">Чат с поддержкой</p>
          <p className="text-white/70 text-xs">Онлайн · Ответ за 2 мин</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="w-5 h-5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
      {[
        { title: "Часто задаваемые вопросы", items: ["Как изменить маршрут?", "Что делать если водитель не едет?", "Как получить возврат?", "Как изменить способ оплаты?"] },
        { title: "Проблемы с поездкой", items: ["Водитель не приехал", "Забыл вещь в машине", "Проблема с платежом", "Неприемлемое поведение"] },
      ].map((section, si) => (
        <div key={si} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <p className="text-[10px] font-semibold text-[#6B7572] uppercase tracking-wider px-4 pt-3 pb-1">{section.title}</p>
          {section.items.map((item, ii) => (
            <button key={ii} className="w-full flex items-center px-4 py-3 border-t border-[#F4F6F4] first:border-0 active:bg-[#F4F6F4]">
              <span className="flex-1 text-sm text-[#111814] text-left">{item}</span>
              <span className="text-[#6B7572]">›</span>
            </button>
          ))}
        </div>
      ))}
      <div className="text-center py-2 text-xs text-[#6B7572]">Номер телефона: <span className="text-[#0A6644] font-medium">8 800 800 0000</span></div>
    </div>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [history, setHistory] = useState<Screen[]>([]);

  const navigate = (s: Screen) => {
    setHistory(h => [...h, screen]);
    setScreen(s);
  };

  const back = () => {
    if (history.length > 0) {
      setScreen(history[history.length - 1]);
      setHistory(h => h.slice(0, -1));
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case "splash": return <SplashScreen onDone={() => navigate("onboarding")} />;
      case "onboarding": return <OnboardingScreen onDone={() => navigate("auth-phone")} />;
      case "auth-phone": return <AuthPhoneScreen onNext={() => navigate("auth-otp")} />;
      case "auth-otp": return <AuthOTPScreen onNext={() => navigate("auth-name")} />;
      case "auth-name": return <AuthNameScreen onNext={() => navigate("home")} />;
      case "home": return <HomeScreen onNavigate={navigate} />;
      case "search": return <SearchScreen onNavigate={navigate} onBack={back} />;
      case "route": return <RouteScreen onNavigate={navigate} onBack={back} />;
      case "ride-types": return <RideTypesScreen onNavigate={navigate} onBack={back} />;
      case "confirm": return <ConfirmScreen onNavigate={navigate} onBack={back} />;
      case "searching": return <SearchingScreen onNavigate={navigate} />;
      case "driver-assigned": return <DriverAssignedScreen onNavigate={navigate} />;
      case "arrived": return <ArrivedScreen onNavigate={navigate} />;
      case "in-progress": return <InProgressScreen onNavigate={navigate} />;
      case "completed": return <CompletedScreen onNavigate={navigate} />;
      case "trips": return <TripsScreen onNavigate={navigate} />;
      case "trip-detail": return <TripDetailScreen onBack={back} />;
      case "eco": return <EcoScreen onNavigate={navigate} />;
      case "profile": return <ProfileScreen onNavigate={navigate} />;
      case "payment": return <PaymentScreen onBack={back} />;
      case "notifications": return <NotificationsScreen onBack={back} />;
      case "support": return <SupportScreen onBack={back} />;
      default: return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full" style={{ background: "#111" }}>
      {/* Phone frame */}
      <div className="relative" style={{ width: 390, height: 844 }}>
        {/* Phone shell */}
        <div className="absolute inset-0 rounded-[50px] border-[10px] border-[#222] shadow-2xl overflow-hidden bg-white z-10 pointer-events-none"/>
        {/* Screen content */}
        <div className="absolute inset-[10px] rounded-[42px] overflow-hidden">
          <div className="w-full h-full relative overflow-hidden bg-white">
            <ErrorBoundary>
              {renderScreen()}
            </ErrorBoundary>
          </div>
        </div>
        {/* Notch */}
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-28 h-7 bg-[#222] rounded-b-2xl z-20 pointer-events-none"/>
        {/* Side buttons */}
        <div className="absolute left-[-14px] top-28 w-1.5 h-10 bg-[#333] rounded-l-sm pointer-events-none"/>
        <div className="absolute left-[-14px] top-44 w-1.5 h-12 bg-[#333] rounded-l-sm pointer-events-none"/>
        <div className="absolute left-[-14px] top-60 w-1.5 h-12 bg-[#333] rounded-l-sm pointer-events-none"/>
        <div className="absolute right-[-14px] top-36 w-1.5 h-16 bg-[#333] rounded-r-sm pointer-events-none"/>
      </div>

      {/* Screen indicator (outside phone) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="bg-black/60 text-white/60 text-xs px-3 py-1.5 rounded-full font-mono">
          {screen}
        </div>
      </div>
    </div>
  );
}
