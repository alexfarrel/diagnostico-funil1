import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nome, whatsapp, email, marca, cargo,
      tipoProduto, vendas, pagina, aquisicao,
      faturamento, objetivo, motivacao, score, stage,
    } = body;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#f4f4f8; margin:0; padding:24px; }
  .wrap { max-width:580px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
  .header { background:#09090b; padding:28px 32px; }
  .header h1 { color:#fff; font-size:20px; margin:0 0 4px; }
  .header p { color:#4ade80; font-size:13px; margin:0; }
  .stage-pill {
    display:inline-block; padding:6px 16px; border-radius:8px;
    font-weight:700; font-size:14px; color:#fff; margin:0 0 16px;
    background: ${stage==='Escala'?'#2563eb':stage==='Crescimento'?'#059669':stage==='Validação'?'#d97706':'#6b7280'};
  }
  .body { padding:28px 32px; }
  .score { font-size:28px; font-weight:800; color:#09090b; margin-bottom:4px; }
  .score-label { font-size:13px; color:#888; margin-bottom:20px; }
  table { width:100%; border-collapse:collapse; margin-top:8px; }
  td { padding:10px 12px; font-size:14px; border-bottom:1px solid #f0f0f4; }
  td:first-child { color:#888; font-size:13px; width:40%; }
  td:last-child { color:#1a1a2e; font-weight:500; }
  .section { margin-top:20px; background:#f8f8fb; border-radius:8px; padding:14px 16px; }
  .section-title { font-size:12px; color:#888; text-transform:uppercase; letter-spacing:.06em; margin-bottom:10px; }
  .motivacao { font-size:14px; color:#333; line-height:1.6; margin-top:8px; }
  .footer { background:#f4f4f8; padding:16px 32px; text-align:center; font-size:12px; color:#aaa; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>🎯 Novo Diagnóstico Recebido</h1>
    <p>Funil de Diagnóstico — Alexandre Oliveira</p>
  </div>
  <div class="body">
    <div class="score">${score} pts</div>
    <div class="score-label">Pontuação total do diagnóstico</div>
    <div class="stage-pill">${stage}</div>

    <div class="section">
      <div class="section-title">Dados do Lead</div>
      <table>
        <tr><td>Nome</td><td>${nome}</td></tr>
        <tr><td>WhatsApp</td><td>${whatsapp}</td></tr>
        <tr><td>E-mail</td><td>${email}</td></tr>
        <tr><td>Marca</td><td>${marca}</td></tr>
        <tr><td>Cargo</td><td>${cargo}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Diagnóstico do Negócio</div>
      <table>
        <tr><td>Tipo de produto</td><td>${tipoProduto}</td></tr>
        <tr><td>Vendas online</td><td>${vendas}</td></tr>
        <tr><td>Página de vendas</td><td>${pagina}</td></tr>
        <tr><td>Canais de aquisição</td><td>${aquisicao}</td></tr>
        <tr><td>Faturamento (3 meses)</td><td>${faturamento}</td></tr>
        <tr><td>Objetivo principal</td><td>${objetivo}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Motivação</div>
      <div class="motivacao">${motivacao.replace(/\n/g,'<br>')}</div>
    </div>
  </div>
  <div class="footer">Enviado via funil de diagnóstico · alexandreproso@gmail.com</div>
</div>
</body>
</html>`;

    const { error } = await resend.emails.send({
      from: 'Diagnóstico <contato@alexandreoliveira.sbs>',
      to: ['alexandreproso@gmail.com'],
      subject: `🎯 Novo lead: ${nome} — Estágio ${stage} (${score} pts)`,
      html,
      reply_to: email,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
