// Validação compartilhada entre função de recebimento e testes automatizados.
// Não coloque endereço, token, dados pessoais ou chave de serviço aqui.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES + 64 * 1024;
const COURSES = {
  "Técnico em Gastronomia": "technical",
  "Tecnólogo em Gastronomia": "technologist",
  "Ambos os cursos": "both",
};
const IMPACT = {
  "Impede a atividade ou oferece risco": "urgent",
  "Prejudica, mas permite continuar": "disruptive",
  "Sugestão preventiva ou melhoria": "improvement",
};
const CATEGORIES = new Set([
  "Equipamento com defeito", "Manutenção de espaço",
  "Compra de utensílio ou equipamento", "Falta de material",
  "Organização de laboratório", "Problema durante atividade prática",
  "Acessibilidade", "Outra ocorrência",
]);
export class InputError extends Error {
  constructor(message, status = 400) { super(message); this.name = "InputError"; this.status = status; }
}
function optionalString(value, max) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new InputError("Um dos campos foi preenchido incorretamente.");
  const trimmed = value.trim();
  if (trimmed.length > max) throw new InputError("Um dos campos ultrapassa o limite permitido.");
  return trimmed || null;
}
function requiredString(value, max, field) {
  const output = optionalString(value, max);
  if (!output) throw new InputError("Preencha " + field + ".");
  return output;
}
export function validateOccurrence(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new InputError("Dados inválidos.");
  const course = COURSES[input.course];
  const impact = IMPACT[input.priority];
  if (!course) throw new InputError("Selecione um curso válido.");
  if (!impact) throw new InputError("Selecione como a situação afeta as atividades.");
  const category = requiredString(input.kind, 100, "o tipo da ocorrência");
  if (!CATEGORIES.has(category)) throw new InputError("Tipo de ocorrência não reconhecido.");
  const location = requiredString(input.place, 170, "o local da ocorrência");
  const description = requiredString(input.details, 4000, "a descrição da ocorrência");
  if (description.length < 12) throw new InputError("Descreva a situação com um pouco mais de detalhe.");
  const role = requiredString(input.role, 100, "seu vínculo");
  if (!new Set(["Estudante", "Docente", "Técnico(a) administrativo(a)", "Egresso(a)", "Comunidade externa"]).has(role))
    throw new InputError("Selecione um vínculo válido.");
  const observed = optionalString(input.when, 10);
  if (observed && (!/^\d{4}-\d{2}-\d{2}$/.test(observed) || Number.isNaN(Date.parse(observed)) ||
      new Date(observed).toISOString().slice(0,10) !== observed)) throw new InputError("Data inválida.");
  const email = optionalString(input.reply, 180);
  if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email)))
    throw new InputError("Verifique o e-mail informado.");
  const name = optionalString(input.name, 120);
  if (name && !input.contactConsent) throw new InputError("Confirme a autorização para guardar seu nome.");
  if (email && !input.contactConsent) throw new InputError("Confirme a autorização para guardar seu e-mail.");
  return {
    origin: "occurrence", course, submitter_role: role, category, title: category + " | " + location,
    description, location, observed_on: observed, impact,
    proposed_action: optionalString(input.proposal, 1800),
    submitter_name: name, submitter_email: email,
    identification_consent: !!input.contactConsent,
  };
}
export function inspectImage(bytes, declaredType) {
  if (!bytes) return null;
  if (!(bytes instanceof Uint8Array)) throw new InputError("Formato do anexo inválido.");
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new InputError("A foto deve ter até 5 MB.");
  const jpg = bytes.length > 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = bytes.length > 8 && [137,80,78,71,13,10,26,10].every((n,i)=>bytes[i] === n);
  const webp = bytes.length > 12 && String.fromCharCode(...bytes.slice(0,4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8,12)) === "WEBP";
  const type = jpg ? "image/jpeg" : png ? "image/png" : webp ? "image/webp" : null;
  if (!type || type !== declaredType) throw new InputError("A foto precisa ser JPG, PNG ou WebP válido.");
  return { mime: type, extension: type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp" };
}
export function validateOrigin(origin, allowed) {
  if (!origin || origin !== allowed) throw new InputError("Origem da solicitação não autorizada.", 403);
}
export function validateTurnstileProof(proof, hostname, action) {
  return !!(proof && proof.success === true && proof.hostname === hostname && proof.action === action);
}
