/**
 * Design: «طاولة المحرّر» لعجلة أسماء — أسطح تحريرية داكنة دافئة،
 * المرجاني لقرار الاختيار فقط، وخاتم الإيقاع يربط العجلة والسجل.
 */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Winner = { name: string; at: string; round: number };

const starterNames = ["ليان", "عمر", "ريم", "خالد", "نورة", "سامي"];
const sliceColors = ["#2b2722", "#5a3128", "#4e4930", "#382f28", "#65392e", "#272521", "#4c4030", "#392822"];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return <svg className="icon" width={size} height={size} aria-hidden="true" focusable="false"><use href={`#icon-${name}`} /></svg>;
}

function IconSprite() {
  return (
    <svg className="icon-sprite" aria-hidden="true" focusable="false">
      <symbol id="icon-play" viewBox="0 0 24 24"><path d="M8 5.5v13l10-6.5-10-6.5Z" /></symbol>
      <symbol id="icon-rotate" viewBox="0 0 24 24"><path d="M19 8.5A8 8 0 1 0 20 15" /><path d="M19 4v4.5h-4.5" /></symbol>
      <symbol id="icon-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
      <symbol id="icon-close" viewBox="0 0 24 24"><path d="m7 7 10 10m0-10L7 17" /></symbol>
      <symbol id="icon-trash" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6m4-6v6M9 7l1-2h4l1 2m-9 0 1 13h10l1-13" /></symbol>
      <symbol id="icon-undo" viewBox="0 0 24 24"><path d="M9 8 5 12l4 4" /><path d="M5.5 12H15a4 4 0 1 1 0 8h-1" /></symbol>
      <symbol id="icon-random" viewBox="0 0 24 24"><path d="M4 7h3.5c3 0 3 10 6 10H20" /><path d="m17 14 3 3-3 3M4 17h3.5c1 0 1.8-1.1 2.5-2.5M17 4l3 3-3 3" /></symbol>
      <symbol id="icon-copy" viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="1.5" /><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" /></symbol>
      <symbol id="icon-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4L19 7" /></symbol>
      <symbol id="icon-spark" viewBox="0 0 24 24"><path d="m12 3 1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3L12 3ZM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></symbol>
      <symbol id="icon-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 11v5m0-8h.01" /></symbol>
    </svg>
  );
}

function HeroWheelArt() {
  return (
    <svg className="hero-wheel-art" viewBox="0 0 720 420" role="img" aria-label="عجلة تجريدية لاختيار الأسماء">
      <rect width="720" height="420" fill="#171411" />
      <g transform="translate(268 210)">
        <circle r="180" fill="#1d1916" stroke="#4a4137" strokeWidth="2" />
        <circle r="157" fill="none" stroke="#2c2722" strokeWidth="18" />
        {Array.from({ length: 20 }, (_, index) => <path key={index} d="M0,-139 L0,-171" stroke={index % 5 === 0 ? "#E2B15C" : "#6F6759"} strokeWidth={index % 5 === 0 ? "2" : "1"} transform={`rotate(${index * 18})`} />)}
        {Array.from({ length: 8 }, (_, index) => <path key={`slice-${index}`} d="M0,0 L0,-132 A132,132 0 0,1 93.34,-93.34 Z" fill={sliceColors[index]} stroke="#131110" strokeWidth="2" transform={`rotate(${index * 45})`} />)}
        <circle r="71" fill="#211d19" stroke="#E2B15C" strokeOpacity=".55" />
        <circle r="49" fill="#171411" stroke="#3b342d" />
        <text textAnchor="middle" y="-2" fill="#E2B15C" fontFamily="Alexandria, sans-serif" fontWeight="800" fontSize="31">ع</text>
        <text textAnchor="middle" y="21" fill="#A89F91" fontFamily="IBM Plex Sans Arabic, sans-serif" fontSize="11">اختيار</text>
        <path d="M0,-205 l-14,-28 h28 Z" fill="#FF5A2D" />
      </g>
      <g fill="none" stroke="#E2B15C" strokeOpacity=".42">
        <circle cx="585" cy="78" r="32" strokeDasharray="150 51" transform="rotate(-30 585 78)" />
        <circle cx="584" cy="78" r="15" strokeDasharray="62 32" transform="rotate(70 584 78)" />
      </g>
      <path d="M470 310 H672" stroke="#6F6759" strokeOpacity=".55" />
      <text x="470" y="336" fill="#A89F91" fontFamily="IBM Plex Mono, monospace" fontSize="12">NAME / MOTION / MARK</text>
    </svg>
  );
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radian = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radian), y: cy + radius * Math.sin(radian) };
}

function sectorPath(cx: number, cy: number, radius: number, start: number, end: number) {
  const startPoint = polar(cx, cy, radius, end);
  const endPoint = polar(cx, cy, radius, start);
  const largeArc = end - start <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} 0 ${endPoint.x} ${endPoint.y} Z`;
}

function NameWheel({ names, rotation, winnerIndex, spinning }: { names: string[]; rotation: number; winnerIndex: number | null; spinning: boolean }) {
  const segment = names.length ? 360 / names.length : 360;
  return (
    <div className="wheel-stage" aria-label="عجلة اختيار الأسماء">
      <div className="wheel-pointer"><span /></div>
      <div className={`name-wheel ${spinning ? "is-spinning" : ""}`} style={{ transform: `rotate(${rotation}deg)` }}>
        <svg viewBox="0 0 360 360" role="img" aria-label={names.length ? `عجلة فيها ${names.length} أسماء` : "عجلة فارغة"}>
          <circle cx="180" cy="180" r="174" fill="#171411" stroke="rgba(240,235,226,.18)" strokeWidth="1" />
          <g>
            {names.length ? names.map((name, index) => {
              const start = index * segment;
              const end = (index + 1) * segment;
              const center = start + segment / 2;
              const text = polar(180, 180, names.length > 10 ? 108 : 112, center);
              const textRotate = center > 90 && center < 270 ? center + 180 : center;
              return (
                <g key={`${name}-${index}`}>
                  <path d={sectorPath(180, 180, 168, start, end)} fill={sliceColors[index % sliceColors.length]} stroke="rgba(240,235,226,.18)" strokeWidth="1" />
                  <text x={text.x} y={text.y} fill="#F0EBE2" textAnchor="middle" dominantBaseline="central" transform={`rotate(${textRotate} ${text.x} ${text.y})`} className="wheel-label">{name.length > 11 ? `${name.slice(0, 10)}…` : name}</text>
                </g>
              );
            }) : <circle cx="180" cy="180" r="168" fill="#211d19" />}
          </g>
          <circle cx="180" cy="180" r="54" fill="#211d19" stroke="rgba(226,177,92,.48)" strokeWidth="1" />
          <circle cx="180" cy="180" r="38" fill="#171411" stroke="rgba(240,235,226,.12)" strokeWidth="1" />
          <text x="180" y="174" textAnchor="middle" className="wheel-center-r">R</text>
          <text x="180" y="195" textAnchor="middle" className="wheel-center-note">اختيار</text>
          {winnerIndex !== null && names.length > 0 && <circle cx="180" cy="14" r="8" fill="#E2B15C" stroke="#131110" strokeWidth="4" />}
        </svg>
      </div>
      <div className="wheel-footnote"><span className="rhythm-ring" /><span>{spinning ? "العجلة في طريقها إلى الاسم…" : "المؤشر يحدد اسمًا واحدًا عند التوقف."}</span></div>
    </div>
  );
}

function NameList({ names, spinning, onRemove, onMove }: { names: string[]; spinning: boolean; onRemove: (index: number) => void; onMove: (index: number, direction: -1 | 1) => void }) {
  if (!names.length) return <div className="empty-state list-empty"><Icon name="plus" /><strong>القائمة جاهزة لاستقبال الأسماء.</strong><span>أضف اسمًا واحدًا أو الصق قائمة كاملة.</span></div>;
  return (
    <div className="name-list" aria-label="قائمة المشاركين">
      {names.map((name, index) => (
        <div className="name-row" key={`${name}-${index}`}>
          <span className="name-order mono">{String(index + 1).padStart(2, "0")}</span>
          <span className="name-value">{name}</span>
          <div className="name-actions">
            <button type="button" disabled={spinning || index === 0} onClick={() => onMove(index, -1)} aria-label={`نقل ${name} للأعلى`}>↑</button>
            <button type="button" disabled={spinning || index === names.length - 1} onClick={() => onMove(index, 1)} aria-label={`نقل ${name} للأسفل`}>↓</button>
            <button type="button" disabled={spinning} onClick={() => onRemove(index)} aria-label={`حذف ${name}`}><Icon name="close" size={15} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [names, setNames] = useState<string[]>(starterNames);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [newName, setNewName] = useState("");
  const [bulkNames, setBulkNames] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [removeWinner, setRemoveWinner] = useState(false);

  useEffect(() => {
    const savedNames = window.localStorage.getItem("name-wheel-names");
    const savedWinners = window.localStorage.getItem("name-wheel-winners");
    if (savedNames) setNames(JSON.parse(savedNames));
    if (savedWinners) setWinners(JSON.parse(savedWinners));
  }, []);

  useEffect(() => window.localStorage.setItem("name-wheel-names", JSON.stringify(names)), [names]);
  useEffect(() => window.localStorage.setItem("name-wheel-winners", JSON.stringify(winners)), [winners]);

  const currentWinner = winnerIndex === null ? null : names[winnerIndex];
  const participantCopy = useMemo(() => names.length === 1 ? "مشارك واحد" : `${names.length} مشاركين`, [names.length]);

  const addNames = (raw: string) => {
    const candidates = raw.split(/[\n,،]+/).map((name) => name.trim()).filter(Boolean);
    if (!candidates.length) { toast.error("اكتب اسمًا واحدًا على الأقل."); return; }
    const unique = candidates.filter((candidate) => !names.includes(candidate));
    if (!unique.length) { toast.info("كل الأسماء المكتوبة موجودة بالفعل في القائمة."); return; }
    setNames((current) => [...current, ...unique]);
    setNewName("");
    setBulkNames("");
    toast.success(`أُضيف ${unique.length === 1 ? "اسم واحد" : `${unique.length} أسماء`} إلى العجلة.`);
  };

  const spin = () => {
    if (spinning) return;
    if (names.length < 2) { toast.error("أضف اسمين على الأقل حتى تبدأ العجلة."); return; }
    const selected = Math.floor(Math.random() * names.length);
    const segment = 360 / names.length;
    const current = ((rotation % 360) + 360) % 360;
    const desired = ((-(selected + .5) * segment) % 360 + 360) % 360;
    const delta = (desired - current + 360) % 360;
    const selectedName = names[selected];
    setSpinning(true);
    setWinnerIndex(null);
    setRotation((currentRotation) => currentRotation + 2160 + delta);
    window.setTimeout(() => {
      setWinnerIndex(selected);
      setWinners((currentWinners) => [{ name: selectedName, at: new Intl.DateTimeFormat("ar-EG", { hour: "2-digit", minute: "2-digit" }).format(new Date()), round: currentWinners.length + 1 }, ...currentWinners].slice(0, 8));
      if (removeWinner) setNames((currentNames) => currentNames.filter((_, index) => index !== selected));
      setSpinning(false);
      toast.success(`الاختيار وقع على: ${selectedName}`);
    }, 2200);
  };

  const shuffle = () => {
    if (spinning) return;
    setNames((current) => [...current].sort(() => Math.random() - .5));
    setWinnerIndex(null);
    toast.success("أُعيد ترتيب الأسماء عشوائيًا.");
  };

  const moveName = (index: number, direction: -1 | 1) => {
    setNames((current) => {
      const next = [...current];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
  };

  return (
    <div className="app-shell" id="top">
      <IconSprite />
      <div className="paper-noise" aria-hidden="true"><svg viewBox="0 0 150 150"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="4" stitchTiles="stitch" /></filter><rect width="100%" height="100%" filter="url(#noise)" opacity=".9" /></svg></div>
      <main className="page-frame">
        <header className="site-header">
          <a className="brand" href="#top" aria-label="عجلة، العودة إلى البداية"><span className="brand-symbol" aria-hidden="true"><b>ع</b><i /></span><span className="brand-wordmark">عجلة</span></a>
          <div className="header-status"><span>اختيار عشوائي محلي</span><span className="header-ring" /></div>
        </header>

        <section className="intro" aria-labelledby="page-title">
          <div className="intro-copy reveal">
            <span className="eyebrow">اختيار عادل · قائمة خاصة بك</span>
            <h1 id="page-title">من الاسم الذي<br /><em>سيأتي دوره؟</em></h1>
            <p>أضف المشاركين، دوّر العجلة، واترك المؤشر يختار اسمًا واحدًا. كل شيء يبقى على جهازك داخل هذه الجلسة.</p>
            <div className="intro-actions"><a className="primary-button" href="#wheel"><Icon name="play" /> أنشئ اختيارًا</a><a className="ghost-button" href="#names"><Icon name="plus" /> أدِر الأسماء</a></div>
          </div>
          <figure className="intro-visual reveal delay-one"><HeroWheelArt /><figcaption><span>الفصل 01</span><span>أسماء · حركة · اختيار</span></figcaption></figure>
        </section>

        <section className="session-note reveal delay-two"><div className="note-mark"><Icon name="spark" /></div><p>الملاحظة الأساسية: لا يوجد ترتيب مفضل. كل اسم حاضر في العجلة يحصل على فرصة مساوية في هذه الدورة.</p><span className="mono">{participantCopy}</span></section>

        <section className="wheel-section section-rule" id="wheel" aria-labelledby="wheel-title">
          <div className="section-heading play-heading"><span className="section-index mono">01</span><span className="eyebrow">المشهد الرئيسي</span><h2 id="wheel-title">القائمة مكتملة؟<br /><em>ابدأ الحركة.</em></h2><p>راجع الأسماء مرة أخيرة، ثم حرّك المؤشر. تستطيع استبعاد الاسم المختار من الدورة التالية إن شئت.</p></div>
          <div className="wheel-layout">
            <div className="wheel-panel reveal"><NameWheel names={names} rotation={rotation} winnerIndex={winnerIndex} spinning={spinning} /></div>
            <div className="wheel-controls reveal delay-one">
              <div className="control-heading"><span>حالة الجولة</span><span className="chip">{participantCopy}</span></div>
              <div className="winner-box" aria-live="polite">
                <span className="eyebrow">الاختيار الأخير</span>
                <strong>{spinning ? "…" : currentWinner ?? "بانتظار الدوران"}</strong>
                <p>{spinning ? "تتحرك القطاعات الآن." : currentWinner ? "سُجّل في دفتر الاختيارات." : "اضغط زر الدوران بعد تجهيز الأسماء."}</p>
              </div>
              <label className="switch-row"><input type="checkbox" checked={removeWinner} onChange={(event) => setRemoveWinner(event.target.checked)} /><span className="switch" /><span>إزالة الفائز بعد اختياره</span></label>
              <div className="control-actions"><button type="button" className="primary-button spin-button" onClick={spin} disabled={spinning || names.length < 2}>{spinning ? <span className="spinner" /> : <Icon name="rotate" />}{spinning ? "جارٍ الدوران" : "دوّر العجلة"}</button><button type="button" className="ghost-button" onClick={shuffle} disabled={spinning || names.length < 2}><Icon name="random" /> بدّل الترتيب</button></div>
              <div className="fairness-note"><Icon name="info" /><span>تتغير الزاوية عشوائيًا في كل مرة؛ الترتيب في القائمة لا يؤثر في فرص الاختيار.</span></div>
            </div>
          </div>
        </section>

        <section className="names-section section-rule" id="names" aria-labelledby="names-title">
          <div className="names-head"><span className="section-index mono">02</span><div><span className="eyebrow">دفتر المشاركين</span><h2 id="names-title">أسماء جاهزة،<br /><em>احتمال مفتوح.</em></h2></div><p>تدعم العجلة الأسماء العربية والإنجليزية. الصق قائمة كاملة، أو أضف الأسماء سطرًا بعد سطر.</p></div>
          <div className="names-grid">
            <div className="name-entry">
              <label className="form-label" htmlFor="single-name">اسم مشارك جديد</label>
              <div className="input-row"><input id="single-name" value={newName} onChange={(event) => setNewName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addNames(newName); }} placeholder="مثل: هدى" maxLength={42} /><button type="button" className="primary-button" onClick={() => addNames(newName)}><Icon name="plus" /> إضافة</button></div>
              <button type="button" className="bulk-toggle" onClick={() => setShowBulk(!showBulk)}><Icon name="plus" size={15} /> {showBulk ? "إخفاء الإضافة الجماعية" : "لدي قائمة كاملة"}</button>
              {showBulk && <div className="bulk-entry reveal"><label className="form-label" htmlFor="bulk-names">أسماء متعددة</label><textarea id="bulk-names" value={bulkNames} onChange={(event) => setBulkNames(event.target.value)} placeholder={"هيا\nمروان\nدانة"} /><button type="button" className="ghost-button" onClick={() => addNames(bulkNames)}><Icon name="check" /> أضف القائمة</button></div>}
              <div className="list-tools"><button type="button" className="ghost-button" onClick={() => { setNames(starterNames); setWinners([]); setWinnerIndex(null); toast.success("استُعيدت قائمة البداية."); }} disabled={spinning}><Icon name="undo" /> قائمة البداية</button><button type="button" className="ghost-button danger" onClick={() => { setNames([]); setWinners([]); setWinnerIndex(null); toast.info("أُفرغت القائمة والسجل."); }} disabled={spinning || !names.length}><Icon name="trash" /> مسح الكل</button></div>
            </div>
            <div className="names-list-wrap"><div className="list-caption"><span>القائمة الحالية</span><span className="mono">{names.length.toString().padStart(2, "0")}</span></div><NameList names={names} spinning={spinning} onRemove={(index) => { setNames((current) => current.filter((_, currentIndex) => currentIndex !== index)); setWinnerIndex(null); }} onMove={moveName} /></div>
          </div>
        </section>

        <section className="history-section section-rule" id="history"><div className="history-heading"><span className="section-index mono">03</span><div><span className="eyebrow">دفتر الاختيارات</span><h2>ما اختاره<br /><em>المؤشر.</em></h2></div><p>يحتفظ الدفتر بآخر ثماني دورات محليًا؛ أسماء المجموعة لا تغادر جهازك.</p></div>{winners.length ? <div className="winner-list"><div className="winner-row winner-labels" aria-hidden="true"><span>الدورة</span><span>الاسم المختار</span><span>وقت الاختيار</span><span /></div>{winners.map((winner, index) => <div className="winner-row" key={`${winner.name}-${winner.at}-${index}`}><span className="winner-order mono">{String(winner.round).padStart(2, "0")}</span><span className="winner-name"><i />{winner.name}</span><span className="winner-time">{winner.at}</span><button type="button" className="row-action" aria-label={`نسخ اسم ${winner.name}`} onClick={() => { navigator.clipboard?.writeText(winner.name); toast.success("تم نسخ الاسم المختار."); }}><Icon name="copy" size={16} /></button></div>)}</div> : <div className="empty-state"><Icon name="spark" /><strong>لا يوجد اسم اختاره المؤشر بعد.</strong><span>أكمل القائمة ثم حرّك العجلة لتبدأ أول ملاحظة.</span></div>}</section>

        <section className="closing-note section-rule"><div><span className="eyebrow">نهاية الجلسة</span><h2>الاسم حاضر،<br />والاختيار <em>واحد.</em></h2></div><p>«عجلة» أداة بسيطة للاختيار العشوائي بين المشاركين. قوائمك وسجلك محفوظان محليًا على جهازك ويمكن مسحهما في أي وقت.</p></section>
        <footer className="site-footer"><span>عجلة · اختيار أسماء عشوائي محلي</span><a href="https://instagram.com/pro_hg_i" target="_blank" rel="noreferrer">© 2026 @pro_hg_i · جميع الحقوق محفوظة</a></footer>
      </main>
    </div>
  );
}
