// GASTROIFF | Exemplo de recebimento server-side, não implantado.
// Exige Supabase configurado, Turnstile e revisão de segurança antes do uso.
import {
  MAX_REQUEST_BYTES, MAX_IMAGE_BYTES, InputError, validateOccurrence,
  inspectImage, validateOrigin, validateTurnstileProof,
} from "./validation.mjs";

const ALLOWED_ORIGIN = "https://gustavoguterman-gif.github.io";
const ALLOWED_HOST = "gustavoguterman-gif.github.io";
const CHALLENGE_ACTION = "gastroiff_ocorrencia";
const PRIVATE_BUCKET = "gastroiff-private";

function json(status: number, data: unknown, origin = ALLOWED_ORIGIN) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": origin,
      "Vary": "Origin",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

async function limitedBytes(req: Request, max: number) {
  const reader = req.body?.getReader();
  if (!reader) throw new InputError("Envio vazio.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > max) {
        await reader.cancel();
        throw new InputError("O envio ultrapassa o limite de tamanho.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const all = new Uint8Array(total);
  let pos = 0;
  for (const piece of chunks) { all.set(piece, pos); pos += piece.byteLength; }
  return all;
}

async function turnstileValid(token: string, secret: string) {
  if (!token || token.length > 2048) return false;
  const proof = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
    signal: AbortSignal.timeout(8000),
  });
  if (!proof.ok) return false;
  const data = await proof.json();
  return validateTurnstileProof(data, ALLOWED_HOST, CHALLENGE_ACTION);
}

async function supabaseCall(url: string, secret: string, path: string, init: RequestInit) {
  const headers = new Headers(init.headers);
  headers.set("apikey", secret);
  headers.set("Authorization", "Bearer " + secret);
  const response = await fetch(url + path, { ...init, headers, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error("Erro no armazenamento seguro, status " + response.status);
  return response;
}

Deno.serve(async req => {
  try {
    validateOrigin(req.headers.get("Origin"), ALLOWED_ORIGIN);
    if (req.method === "OPTIONS") return json(200, { ok: true });
    if (req.method !== "POST") return json(405, { error: "Método não permitido." });

    // Bloqueio de implantação: credenciais presentes não autorizam coleta real.
    // Exige habilitação explícita depois dos testes e da autorização institucional.
    if (Deno.env.get("GASTROIFF_OCCURRENCES_ENABLED") !== "true")
      return json(503, { error: "O recebimento de ocorrências ainda não está disponível." });

    const base = Deno.env.get("SUPABASE_URL");
    const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const challengeSecret = Deno.env.get("TURNSTILE_SECRET");
    if (!base || !secret || !challengeSecret)
      return json(503, { error: "O recebimento está temporariamente indisponível." });

    const contentType = req.headers.get("Content-Type") ?? "";
    if (!contentType.startsWith("multipart/form-data;"))
      throw new InputError("Envie os dados pelo formulário do GASTROIFF.");
    const claimed = Number(req.headers.get("Content-Length") || 0);
    if (claimed > MAX_REQUEST_BYTES) throw new InputError("O envio ultrapassa o limite de tamanho.", 413);
    const data = await limitedBytes(req, MAX_REQUEST_BYTES);
    const form = await new Request("https://local.invalid/form", {
      method: "POST", headers: { "Content-Type": contentType }, body: data,
    }).formData();

    const token = form.get("turnstileToken");
    if (typeof token !== "string" || !(await turnstileValid(token, challengeSecret)))
      throw new InputError("Não foi possível confirmar o envio. Atualize a página e tente novamente.", 403);

    const raw: Record<string, unknown> = {};
    for (const key of ["course","role","kind","place","when","priority","details","proposal","name","reply"])
      raw[key] = form.get(key);
    raw.contactConsent = form.get("contactConsent") === "true";
    const occurrence = validateOccurrence(raw);

    const imageFile = form.get("photo");
    let photo: { bytes: Uint8Array; type: string; extension: string } | null = null;
    if (imageFile && imageFile instanceof File && imageFile.size) {
      if (imageFile.size > MAX_IMAGE_BYTES) throw new InputError("A foto deve ter até 5 MB.", 413);
      const bytes = new Uint8Array(await imageFile.arrayBuffer());
      const info = inspectImage(bytes, imageFile.type);
      photo = { bytes, type: info!.mime, extension: info!.extension };
    }

    // A foto é enviada primeiro, mas somente ao espaço privado e com nome aleatório.
    // Se qualquer etapa posterior falhar, o arquivo é retirado na tentativa de compensação.
    const objectPath = photo ? "occurrences/" + crypto.randomUUID() + "." + photo.extension : null;
    const service = base.replace(/\/$/, "");
    if (photo && objectPath)
      await supabaseCall(service, secret, "/storage/v1/object/" + PRIVATE_BUCKET + "/" + objectPath, {
        method: "POST",
        headers: { "Content-Type": photo.type, "x-upsert": "false" },
        body: new Blob([new Uint8Array(photo.bytes)], { type: photo.type }),
      });

    let requestId: string | null = null;
    try {
      const created = await supabaseCall(service, secret, "/rest/v1/gi_requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Prefer": "return=representation" },
        body: JSON.stringify(occurrence),
      });
      const rows = await created.json();
      const row = rows[0];
      if (!row?.id || !row?.protocol) throw new Error("Resposta inesperada no registro.");
      requestId = row.id;
      if (photo && objectPath) {
        await supabaseCall(service, secret, "/rest/v1/gi_attachments", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: requestId, object_path: objectPath,
            file_name: "foto." + photo.extension,
            content_type: photo.type, byte_size: photo.bytes.byteLength,
          }),
        });
      }
      await supabaseCall(service, secret, "/rest/v1/gi_request_actions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({request_id: requestId, action_type: "received", responsible_role: "triage"}),
      });
      // Não gera e-mail nem afirma encaminhamento antes de existir serviço de notificação.
      return json(201, { ok: true, protocol: row.protocol, message: "Registro recebido. Guarde seu número de acompanhamento." });
    } catch (error) {
      // Compensação best-effort: a configuração precisa incluir auditoria e alerta
      // para falhas de remoção em produção; não expor detalhes de falhas internas.
      if (requestId) {
        try { await supabaseCall(service, secret, "/rest/v1/gi_requests?id=eq." + encodeURIComponent(requestId), {method: "DELETE"}); } catch { /* revisar nos logs privados */ }
      }
      if (objectPath) {
        try { await supabaseCall(service, secret, "/storage/v1/object/" + PRIVATE_BUCKET + "/" + objectPath, {method: "DELETE"}); } catch { /* revisar nos logs privados */ }
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof InputError) return json(error.status, { error: error.message });
    console.error("Falha no recebimento de ocorrência", error instanceof Error ? error.name : "unknown");
    return json(500, { error: "Não foi possível concluir o registro. Nenhuma confirmação de recebimento foi emitida." });
  }
});
