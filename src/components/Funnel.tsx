'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface FormState {
  name: string;
  countryCode: string;
  whatsapp: string;
  email: string;
  brand: string;
  cargo: string;
  tipoProduto: string;
  vendas: string;
  pagina: string;
  aquisicao: string[];
  faturamento: string;
  objetivo: string;
  motivacao: string;
}

type Stage = 'Início' | 'Validação' | 'Crescimento' | 'Escala';

const COUNTRIES = [
  { code: '+55', flag: '🇧🇷' },
  { code: '+1',  flag: '🇺🇸' },
  { code: '+351',flag: '🇵🇹' },
  { code: '+54', flag: '🇦🇷' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+34', flag: '🇪🇸' },
];

// ─── Scoring ─────────────────────────────────────────────────────────────────
function calcScore(form: FormState): { score: number; stage: Stage } {
  const vendasMap: Record<string,number> = {
    'Ainda não vendemos': 0,
    'Vendemos pouco': 1,
    'Vendemos com alguma consistência': 2,
    'Já vendemos bem e queremos escalar': 3,
  };
  const paginaMap: Record<string,number> = {
    'Não tenho página ainda': 0,
    'Tenho, mas não converte bem': 1,
    'Tenho, mas pode melhorar': 2,
    'Tenho e ela já vende bem': 3,
  };
  const fatMap: Record<string,number> = {
    'Até R$50 mil': 0,
    'De R$50 mil a R$100 mil': 1,
    'De R$100 mil a R$500 mil': 2,
    'De R$500 mil a R$1 milhão': 3,
    'De R$1 milhão a R$2 milhões': 4,
    'Acima de R$2 milhões': 5,
  };
  const tipoMap: Record<string,number> = {
    'Ainda estou estruturando': -1,
    'Produto físico': 1,
    'Serviço': 1,
    'Produto digital': 2,
    'Infoproduto': 2,
  };

  let s = 0;
  s += vendasMap[form.vendas] ?? 0;
  s += paginaMap[form.pagina] ?? 0;

  const realChannels = form.aquisicao.filter(a => a !== 'Ainda não temos aquisição estruturada').length;
  s += realChannels === 0 ? 0 : realChannels === 1 ? 1 : realChannels <= 3 ? 2 : 3;

  s += fatMap[form.faturamento] ?? 0;
  s += tipoMap[form.tipoProduto] ?? 0;

  let stage: Stage;
  if (s <= 4) stage = 'Início';
  else if (s <= 8) stage = 'Validação';
  else if (s <= 12) stage = 'Crescimento';
  else stage = 'Escala';

  // Exception caps
  if (form.vendas === 'Ainda não vendemos' && (stage === 'Crescimento' || stage === 'Escala')) stage = 'Validação';
  if (form.pagina === 'Não tenho página ainda' && stage === 'Escala') stage = 'Crescimento';
  const hasNoAquisicao = form.aquisicao.length === 0 ||
    (form.aquisicao.includes('Ainda não temos aquisição estruturada') && form.aquisicao.length === 1);
  if (hasNoAquisicao && (stage === 'Crescimento' || stage === 'Escala')) stage = 'Validação';

  return { score: s, stage };
}

// ─── Stage content ────────────────────────────────────────────────────────────
const STAGE_INFO: Record<Stage, { color: string; desc: string }> = {
  'Início': {
    color: '#6b7280',
    desc: 'Sua estrutura ainda não está preparada para gerar vendas com consistência. Neste momento, o maior desafio não é escalar — é construir uma base sólida que permita validar sua oferta e começar a atrair clientes de forma previsível.',
  },
  'Validação': {
    color: '#d97706',
    desc: 'Você já deu os primeiros passos e validou que existe demanda. Agora o principal gargalo está na falta de consistência: as vendas acontecem, mas ainda não seguem um processo estruturado e previsível.',
  },
  'Crescimento': {
    color: '#059669',
    desc: 'Sua operação já funciona e gera resultados com certa consistência. Neste nível, o crescimento depende de otimizar sua estrutura — principalmente conversão e fluxo de vendas — para evitar desperdício de oportunidades.',
  },
  'Escala': {
    color: '#2563eb',
    desc: 'Sua empresa tem volume e consistência. O foco agora é multiplicar resultados com sistemas de escala sem perder eficiência operacional.',
  },
};

// ─── UI primitives ────────────────────────────────────────────────────────────
function Card({ children, key: _key }: { children: React.ReactNode; key?: number }) {
  return (
    <div
      className="animate-fadeup relative z-10 w-full"
      style={{
        background: '#131318',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: '32px 28px',
        maxWidth: 420,
        margin: '0 auto',
      }}
    >
      {children}
    </div>
  );
}

function Author({ sub }: { sub: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
      <img
  src="/avatar.png"
  alt="Alexandre Oliveira"
  style={{
    width:38,
    height:38,
    borderRadius:'50%',
    objectFit:'cover',
    flexShrink:0,
    border:'2px solid rgba(100,255,160,0.22)',
  }}
/>
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:'#f0f0f0', fontFamily:'Syne,sans-serif' }}>Alexandre Oliveira</div>
        <div style={{ fontSize:12, color:'#555', marginTop:1 }}>{sub}</div>
      </div>
    </div>
  );
}

function ProgressBar({ step, total = 12 }: { step: number; total?: number }) {
  return (
    <div style={{ height:2, background:'rgba(255,255,255,0.06)', borderRadius:2, marginBottom:20, overflow:'hidden' }}>
      <div style={{ height:'100%', background:'#4ade80', borderRadius:2, width:`${Math.round(step/total*100)}%`, transition:'width .4s ease' }} />
    </div>
  );
}

function QBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background:'#1a1a22', border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:14, padding:'18px 20px', marginBottom:16,
    }}>
      {children}
    </div>
  );
}

function StyledInput({ value, onChange, type='text', placeholder, onEnter, autoFocus }: {
  value: string; onChange: (v:string)=>void; type?: string;
  placeholder?: string; onEnter?: ()=>void; autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);
  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && onEnter?.()}
      style={{
        width:'100%', padding:'14px 16px',
        background:'#1a1a22', border:'1.5px solid rgba(255,255,255,0.1)',
        borderRadius:12, color:'#fff',
        fontFamily:'DM Sans,sans-serif', fontSize:15,
        outline:'none', marginBottom:12,
        transition:'border .2s',
      }}
      onFocus={e => (e.target.style.borderColor = '#4ade80')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
    />
  );
}

function Option({ label, selected, onClick }: { label:string; selected:boolean; onClick:()=>void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap:12,
        padding:'13px 16px',
        background: selected ? 'rgba(74,222,128,0.08)' : '#1a1a22',
        border: `1.5px solid ${selected ? '#4ade80' : 'rgba(255,255,255,0.07)'}`,
        borderRadius:12, marginBottom:8, cursor:'pointer',
        fontSize:14, color: selected ? '#4ade80' : '#e0e0e0',
        transition:'all .18s', userSelect:'none',
      }}
    >
      <div style={{
        width:18, height:18, borderRadius:'50%',
        border: `2px solid ${selected ? '#4ade80' : 'rgba(255,255,255,0.2)'}`,
        background: selected ? '#4ade80' : 'transparent',
        flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all .18s',
      }}>
        {selected && <div style={{ width:6, height:6, borderRadius:'50%', background:'#09090b' }} />}
      </div>
      <span>{label}</span>
    </div>
  );
}

function BtnNext({ label='Próximo →', onClick, variant='dark' }: { label?:string; onClick:()=>void; variant?:'green'|'dark'|'gray' }) {
  const styles: Record<string, React.CSSProperties> = {
    green: { background:'#4ade80', color:'#09090b' },
    dark:  { background:'#1e1e28', color:'#fff', border:'1.5px solid rgba(255,255,255,0.1)' },
    gray:  { background:'transparent', color:'#fff', border:'1.5px solid rgba(255,255,255,0.1)' },
  };
  return (
    <button onClick={onClick} style={{
      width:'100%', padding:'15px',
      borderRadius:50, fontFamily:'Syne,sans-serif',
      fontSize:15, fontWeight:700, cursor:'pointer',
      marginBottom:10, border:'none', ...styles[variant],
      transition:'opacity .2s',
    }}
    onMouseEnter={e => (e.currentTarget.style.opacity='.85')}
    onMouseLeave={e => (e.currentTarget.style.opacity='1')}
    >{label}</button>
  );
}

function BtnBack({ onClick }: { onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{
      width:'100%', padding:13,
      background:'transparent', border:'1.5px solid rgba(255,255,255,0.08)',
      borderRadius:50, color:'#666', fontSize:14, cursor:'pointer',
      marginBottom:8, transition:'all .2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.color='#aaa'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; }}
    onMouseLeave={e => { e.currentTarget.style.color='#666'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
    >← Voltar</button>
  );
}

// ─── Main Funnel ──────────────────────────────────────────────────────────────
export default function Funnel() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    name:'', countryCode:'+55', whatsapp:'', email:'', brand:'',
    cargo:'', tipoProduto:'', vendas:'', pagina:'', aquisicao:[],
    faturamento:'', objetivo:'', motivacao:'',
  });
  const [result, setResult] = useState<{ score:number; stage:Stage } | null>(null);
  const [error, setError] = useState('');
  const [animKey, setAnimKey] = useState(0);

  const goTo = (s: number) => { setAnimKey(k => k+1); setStep(s); setError(''); };
  const next = () => goTo(step + 1);
  const prev = () => goTo(step - 1);

  const set = (field: keyof FormState) => (val: string) =>
    setForm(f => ({ ...f, [field]: val }));

  const toggleMulti = (val: string) => {
    setForm(f => {
      const arr = f.aquisicao.includes(val)
        ? f.aquisicao.filter(v => v !== val)
        : [...f.aquisicao, val];
      return { ...f, aquisicao: arr };
    });
  };

  const validate = (): boolean => {
    if (step === 1 && !form.name.trim()) { setError('Por favor, informe seu nome.'); return false; }
    if (step === 2 && !form.whatsapp.trim()) { setError('Por favor, informe seu WhatsApp.'); return false; }
    if (step === 3 && !form.email.trim()) { setError('Por favor, informe seu e-mail.'); return false; }
    if (step === 4 && !form.brand.trim()) { setError('Por favor, informe o nome da sua marca.'); return false; }
    if (step === 12 && !form.motivacao.trim()) { setError('Por favor, conte o que está acontecendo.'); return false; }
    return true;
  };

  const handleNext = () => { if (validate()) next(); };

  const handleSubmit = async () => {
    if (!validate()) return;
    const r = calcScore(form);
    setResult(r);
    goTo(13); // loading

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, aquisicao: form.aquisicao.join(', '), ...r }),
      });
    } catch (e) { console.warn('Email failed', e); }

    setTimeout(() => goTo(14), 3000);
  };

  const renderStep = () => {
    switch (step) {
      // ── Intro ──
      case 0: return (
        <Card key={animKey}>
          <Author sub="Web e UI Designer" />
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:32, fontWeight:800, lineHeight:1.15, marginBottom:16 }}>
            Antes de criar sua página,{' '}
            <span style={{ color:'#4ade80' }}>entendo sua estrutura.</span>
          </div>
          <div style={{ fontSize:14, color:'#888', lineHeight:1.6, marginBottom:32 }}>
            A maioria das marcas acredita que precisa só de uma página de vendas. O que faz uma marca crescer de verdade é a estrutura completa por trás dela.
          </div>
          <button onClick={next} style={{
            padding:'15px 30px', background:'#232330', color:'#fff',
            border:'none', borderRadius:50, fontSize:15, fontWeight:600, cursor:'pointer',
            fontFamily:'DM Sans,sans-serif', transition:'background .2s',
          }}
          onMouseEnter={e=>(e.currentTarget.style.background='#2e2e42')}
          onMouseLeave={e=>(e.currentTarget.style.background='#232330')}
          >Começar diagnóstico →</button>
        </Card>
      );

      // ── Nome ──
      case 1: return (
        <Card key={animKey}>
          <Author sub="01 de 12" />
          <ProgressBar step={1} />
          <QBox><div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>Qual é o seu nome?</div></QBox>
          <StyledInput value={form.name} onChange={set('name')} placeholder="Seu nome" onEnter={handleNext} autoFocus />
          {error && <div style={{ color:'#f87171', fontSize:13, marginBottom:8 }}>{error}</div>}
          <BtnNext onClick={handleNext} />
          <BtnBack onClick={prev} />
          <div style={{ textAlign:'center', fontSize:12, color:'#3a3a50', marginTop:4 }}>Enter para avançar</div>
        </Card>
      );

      // ── WhatsApp ──
      case 2: return (
        <Card key={animKey}>
          <Author sub="02 de 12" />
          <ProgressBar step={2} />
          <QBox><div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>Qual é o seu melhor WhatsApp?</div></QBox>
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            <select
              value={form.countryCode}
              onChange={e => set('countryCode')(e.target.value)}
              style={{
                background:'#1a1a22', border:'1.5px solid rgba(255,255,255,0.1)',
                borderRadius:12, color:'#fff', fontSize:14, padding:'0 12px',
                cursor:'pointer', outline:'none', minWidth:90, height:50,
              }}
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <StyledInput value={form.whatsapp} onChange={set('whatsapp')} type="tel" placeholder="(xx) 9xxxx-xxxx" onEnter={handleNext} autoFocus />
          </div>
          {error && <div style={{ color:'#f87171', fontSize:13, marginBottom:8 }}>{error}</div>}
          <BtnNext onClick={handleNext} />
          <BtnBack onClick={prev} />
          <div style={{ textAlign:'center', fontSize:12, color:'#3a3a50', marginTop:4 }}>Enter para avançar</div>
        </Card>
      );

      // ── Email ──
      case 3: return (
        <Card key={animKey}>
          <Author sub="03 de 12" />
          <ProgressBar step={3} />
          <QBox><div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>Qual é o seu e-mail?</div></QBox>
          <StyledInput value={form.email} onChange={set('email')} type="email" placeholder="seuemail@exemplo.com" onEnter={handleNext} autoFocus />
          {error && <div style={{ color:'#f87171', fontSize:13, marginBottom:8 }}>{error}</div>}
          <BtnNext onClick={handleNext} />
          <BtnBack onClick={prev} />
          <div style={{ textAlign:'center', fontSize:12, color:'#3a3a50', marginTop:4 }}>Enter para avançar</div>
        </Card>
      );

      // ── Marca ──
      case 4: return (
        <Card key={animKey}>
          <Author sub="04 de 12" />
          <ProgressBar step={4} />
          <QBox><div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>Qual é o nome da sua marca?</div></QBox>
          <StyledInput value={form.brand} onChange={set('brand')} placeholder="Nome da marca" onEnter={handleNext} autoFocus />
          {error && <div style={{ color:'#f87171', fontSize:13, marginBottom:8 }}>{error}</div>}
          <BtnNext onClick={handleNext} />
          <BtnBack onClick={prev} />
          <div style={{ textAlign:'center', fontSize:12, color:'#3a3a50', marginTop:4 }}>Enter para avançar</div>
        </Card>
      );

      // ── Cargo ──
      case 5: return (
        <Card key={animKey}>
          <Author sub="05 de 12" />
          <ProgressBar step={5} />
          <QBox><div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>Qual é o seu cargo?</div></QBox>
          {['Fundador / Sócio','CEO','Diretor','Marketing','Autônomo','Outro'].map(o => (
            <Option key={o} label={o} selected={form.cargo === o} onClick={() => { setForm(f=>({...f,cargo:o})); setTimeout(next,250); }} />
          ))}
          <BtnBack onClick={prev} />
        </Card>
      );

      // ── Tipo produto ──
      case 6: return (
        <Card key={animKey}>
          <Author sub="06 de 12" />
          <ProgressBar step={6} />
          <QBox><div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>Você vende qual tipo de produto?</div></QBox>
          {['Produto físico','Produto digital','Infoproduto','Serviço','Ainda estou estruturando'].map(o => (
            <Option key={o} label={o} selected={form.tipoProduto === o} onClick={() => { setForm(f=>({...f,tipoProduto:o})); setTimeout(next,250); }} />
          ))}
          <BtnBack onClick={prev} />
        </Card>
      );

      // ── Vendas ──
      case 7: return (
        <Card key={animKey}>
          <Author sub="07 de 12" />
          <ProgressBar step={7} />
          <QBox><div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>Sua empresa já vende pela internet?</div></QBox>
          {['Ainda não vendemos','Vendemos pouco','Vendemos com alguma consistência','Já vendemos bem e queremos escalar'].map(o => (
            <Option key={o} label={o} selected={form.vendas === o} onClick={() => { setForm(f=>({...f,vendas:o})); setTimeout(next,250); }} />
          ))}
          <BtnBack onClick={prev} />
        </Card>
      );

      // ── Página ──
      case 8: return (
        <Card key={animKey}>
          <Author sub="08 de 12" />
          <ProgressBar step={8} />
          <QBox><div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>Você já tem uma página de vendas?</div></QBox>
          {['Não tenho página ainda','Tenho, mas não converte bem','Tenho, mas pode melhorar','Tenho e ela já vende bem'].map(o => (
            <Option key={o} label={o} selected={form.pagina === o} onClick={() => { setForm(f=>({...f,pagina:o})); setTimeout(next,250); }} />
          ))}
          <BtnBack onClick={prev} />
        </Card>
      );

      // ── Aquisição ──
      case 9: return (
        <Card key={animKey}>
          <Author sub="09 de 12" />
          <ProgressBar step={9} />
          <QBox>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>Como os clientes chegam até você?</div>
            <div style={{ fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'.08em', marginTop:6 }}>Múltipla escolha</div>
          </QBox>
          {['Tráfego pago','Instagram orgânico','Influenciadores','Indicação','Marketplace','Ainda não temos aquisição estruturada'].map(o => (
            <Option key={o} label={o} selected={form.aquisicao.includes(o)} onClick={() => toggleMulti(o)} />
          ))}
          <BtnNext onClick={handleNext} />
          <BtnBack onClick={prev} />
          <div style={{ textAlign:'center', fontSize:12, color:'#3a3a50', marginTop:4 }}>Enter para avançar</div>
        </Card>
      );

      // ── Faturamento ──
      case 10: return (
        <Card key={animKey}>
          <Author sub="10 de 12" />
          <ProgressBar step={10} />
          <QBox><div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>Qual o seu faturamento nos últimos 3 meses?</div></QBox>
          {['Até R$50 mil','De R$50 mil a R$100 mil','De R$100 mil a R$500 mil','De R$500 mil a R$1 milhão','De R$1 milhão a R$2 milhões','Acima de R$2 milhões'].map(o => (
            <Option key={o} label={o} selected={form.faturamento === o} onClick={() => { setForm(f=>({...f,faturamento:o})); setTimeout(next,250); }} />
          ))}
          <BtnBack onClick={prev} />
        </Card>
      );

      // ── Objetivo ──
      case 11: return (
        <Card key={animKey}>
          <Author sub="11 de 12" />
          <ProgressBar step={11} />
          <QBox><div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>Qual é o principal objetivo agora?</div></QBox>
          {['Estruturar as vendas','Melhorar conversão','Criar previsibilidade de receita','Escalar vendas','Construir uma marca forte'].map(o => (
            <Option key={o} label={o} selected={form.objetivo === o} onClick={() => { setForm(f=>({...f,objetivo:o})); setTimeout(next,250); }} />
          ))}
          <BtnBack onClick={prev} />
        </Card>
      );

      // ── Motivação ──
      case 12: return (
        <Card key={animKey}>
          <Author sub="12 de 12" />
          <ProgressBar step={12} />
          <QBox><div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700 }}>O que fez você procurar ajuda para sua marca agora?</div></QBox>
          <textarea
            value={form.motivacao}
            onChange={e => setForm(f => ({...f, motivacao: e.target.value}))}
            placeholder="Conte o que está acontecendo..."
            style={{
              width:'100%', padding:'14px 16px', minHeight:110,
              background:'#1a1a22', border:'1.5px solid rgba(255,255,255,0.1)',
              borderRadius:12, color:'#fff', fontFamily:'DM Sans,sans-serif',
              fontSize:15, outline:'none', marginBottom:12, resize:'vertical',
              transition:'border .2s',
            }}
            onFocus={e=>(e.target.style.borderColor='#4ade80')}
            onBlur={e=>(e.target.style.borderColor='rgba(255,255,255,0.1)')}
          />
          {error && <div style={{ color:'#f87171', fontSize:13, marginBottom:8 }}>{error}</div>}
          <BtnNext label="Enviar diagnóstico →" onClick={handleSubmit} />
          <BtnBack onClick={prev} />
        </Card>
      );

      // ── Loading ──
      case 13: return (
        <Card key={animKey}>
          <div style={{ textAlign:'center', padding:'32px 0' }}>
            <div style={{
              width:48, height:48,
              border:'3px solid rgba(74,222,128,0.15)',
              borderTopColor:'#4ade80',
              borderRadius:'50%',
              animation:'spin 1s linear infinite',
              margin:'0 auto 20px',
            }} />
            <div style={{ fontSize:16, color:'#666' }}>Analisando…</div>
          </div>
          <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </Card>
      );

      // ── Result ──
      case 14: {
        const stage = result?.stage ?? 'Início';
        const info = STAGE_INFO[stage];
        return (
          <Card key={animKey}>
            <Author sub="Diagnóstico" />
            <div style={{ fontSize:11, color:'#4ade80', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:600, marginBottom:10 }}>
              Diagnóstico Preliminar
            </div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, lineHeight:1.2, marginBottom:16 }}>
              Sua empresa está no estágio:
            </div>
            <div style={{
              display:'inline-block', padding:'8px 18px',
              background: info.color, borderRadius:10,
              fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700,
              color:'#fff', marginBottom:20,
            }}>{stage}</div>
            <div style={{ fontSize:14, color:'#888', lineHeight:1.7, marginBottom:24 }}>{info.desc}</div>
            <BtnNext label="Ver próximos passos →" onClick={next} />
          </Card>
        );
      }

      // ── Final ──
      case 15: return (
        <Card key={animKey}>
          <div style={{
            width:64, height:64, borderRadius:'50%',
            background:'linear-gradient(135deg,#2a7a55,#1a4a35)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:22, fontWeight:700, color:'#7fffb2',
            margin:'0 auto 24px',
            border:'3px solid rgba(100,255,160,0.2)',
            fontFamily:'Syne,sans-serif',
          }}>AO</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, textAlign:'center', lineHeight:1.2, marginBottom:20 }}>
            Vamos analisar sua estrutura de verdade.
          </div>
          <div style={{ fontSize:14, color:'#888', lineHeight:1.7, textAlign:'center' }}>
            Nossa equipe vai analisar suas respostas e entender o melhor caminho para acelerar o crescimento da sua marca.
            <br /><br />
            Se identificarmos uma oportunidade real, entraremos em contato com os próximos passos.
          </div>
          <div style={{ fontSize:13, color:'#444', textAlign:'center', marginTop:20 }}>● Alexandre Oliveira</div>
        </Card>
      );

      default: return null;
    }
  };

  return renderStep();
}
