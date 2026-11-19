import { NextResponse } from "next/server";
import { CONTACT_EMAIL, isServiceId } from "@/lib/site";

const MAX_NAME = 80;
const MAX_EMAIL = 120;
const MAX_MESSAGE = 2000;
const MAX_COMPANY = 80;
const RATE_WINDOW_MS = 30_000;

const recentByIp = new Map<string, number>();

interface ContactBody {
  nombre?: unknown;
  email?: unknown;
  mensaje?: unknown;
  servicio?: unknown;
  empresa?: unknown;
  website?: unknown;
}

function asString(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  if (!host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBodies(input: {
  nombre: string;
  email: string;
  mensaje: string;
  servicio: string;
  empresa: string;
}) {
  const subject = input.servicio
    ? `Nuevo proyecto (${input.servicio}) — ${input.nombre}`
    : `Nuevo proyecto — ${input.nombre}`;

  const text = [
    `Nombre: ${input.nombre}`,
    `Email: ${input.email}`,
    input.empresa ? `Empresa: ${input.empresa}` : null,
    input.servicio ? `Servicio: ${input.servicio}` : null,
    "",
    input.mensaje,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const html = `
    <h2>Nuevo mensaje desde roviedo.dev</h2>
    <p><strong>Nombre:</strong> ${escapeHtml(input.nombre)}</p>
    <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
    ${input.empresa ? `<p><strong>Empresa:</strong> ${escapeHtml(input.empresa)}</p>` : ""}
    ${input.servicio ? `<p><strong>Servicio:</strong> ${escapeHtml(input.servicio)}</p>` : ""}
    <p><strong>Mensaje:</strong></p>
    <p>${escapeHtml(input.mensaje).replace(/\n/g, "<br/>")}</p>
  `;

  return { subject, text, html };
}

async function sendWithResend(payload: {
  subject: string;
  text: string;
  html: string;
  replyTo: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const from = process.env.RESEND_FROM ?? "roviedo.dev <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [CONTACT_EMAIL],
      reply_to: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend error", res.status, body);
    return false;
  }
  return true;
}

async function sendWithFormSubmit(payload: {
  nombre: string;
  email: string;
  mensaje: string;
  servicio: string;
  empresa: string;
  subject: string;
}) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: payload.nombre,
      email: payload.email,
      message: payload.mensaje,
      servicio: payload.servicio || "no especificado",
      empresa: payload.empresa || "—",
      _subject: payload.subject,
      _template: "table",
      _captcha: "false",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("FormSubmit error", res.status, body);
    return false;
  }
  return true;
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  const ip = clientIp(req);
  const last = recentByIp.get(ip);
  if (last && Date.now() - last < RATE_WINDOW_MS) {
    return NextResponse.json({ error: "Espera unos segundos antes de enviar otro mensaje." }, { status: 429 });
  }

  let body: ContactBody;
  try {
    body = (await req.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  if (asString(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const nombre = asString(body.nombre, MAX_NAME);
  const email = asString(body.email, MAX_EMAIL);
  const mensaje = asString(body.mensaje, MAX_MESSAGE);
  const empresa = asString(body.empresa, MAX_COMPANY);
  const rawServicio = asString(body.servicio, 32);
  const servicio = isServiceId(rawServicio) ? rawServicio : "";

  if (nombre.length < 2 || !isEmail(email) || mensaje.length < 10) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const payload = buildBodies({ nombre, email, mensaje, servicio, empresa });

  try {
    const sent =
      (await sendWithResend({ ...payload, replyTo: email })) ||
      (await sendWithFormSubmit({ nombre, email, mensaje, servicio, empresa, subject: payload.subject }));

    if (!sent) {
      return NextResponse.json(
        { error: "No se pudo enviar el mensaje. Escríbeme directo al correo." },
        { status: 502 },
      );
    }

    recentByIp.set(ip, Date.now());
    if (recentByIp.size > 200) {
      const cutoff = Date.now() - RATE_WINDOW_MS;
      for (const [key, time] of recentByIp) {
        if (time < cutoff) recentByIp.delete(key);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact send failed", error);
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje. Escríbeme directo al correo." },
      { status: 502 },
    );
  }
}
