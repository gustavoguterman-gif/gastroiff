// GASTROIFF: cálculo interno para revisão, sem publicação ou acesso ao banco.
// Entradas devem vir exclusivamente de serviço protegido, nunca de arquivos públicos.
const COURSES=new Set(["technical","technologist"]);
const BINARY_FIELDS=Object.freeze({
 working:"Situação de trabalho",
 gastronomy_work:"Atuação na Gastronomia",
 study_continuity:"Continuidade dos estudos"
});
export function compileAlumniDraft({surveyId,course,instrumentVersion,periodLabel,responses,verifiedAt}){
 if(typeof surveyId!=="string"||!surveyId||!COURSES.has(course)
  ||!Number.isSafeInteger(instrumentVersion)||instrumentVersion<1
  ||typeof periodLabel!=="string"||!/^[0-9]{4}(?:-[0-9]{4})?$/.test(periodLabel)
  ||!Array.isArray(responses)||responses.length>100000
  ||typeof verifiedAt!=="string"||!/^\d{4}-\d{2}-\d{2}T/.test(verifiedAt))
  throw Error("Parâmetros do cálculo inválidos.");
 const valid=responses.filter(row=>row&&row.survey_id===surveyId&&row.instrument_version===instrumentVersion
  &&row.answers&&typeof row.answers==="object"&&!Array.isArray(row.answers));
 const entries=[];
 // Não cruzar coortes, ocupações ou combinações de filtros, para evitar
 // reidentificação por subtração entre séries publicadas.
 for(const [key,label] of Object.entries(BINARY_FIELDS)){
  const yes=valid.filter(r=>r.answers[key]==="yes").length;
  const no=valid.filter(r=>r.answers[key]==="no").length;
  const denominator=yes+no;
  // Supressão complementar: nunca publicar uma opção quando a outra
  // tem menos de cinco casos, mesmo que o denominador seja maior.
  if(yes<5||no<5)continue;
  const methodology="Questão de resposta sim/não. Desconsidera sem resposta e prefiro não informar. Prévia sujeita à revisão institucional e análise de risco por cruzamento.";
  for(const [category,n] of [["yes",yes],["no",no]]){
   entries.push(Object.freeze({
    survey_id:surveyId,course,period_label:periodLabel,
    metric_key:key,metric_label:label,category_label:category,
    responses_count:denominator,eligible_count:null,
    measured_value:Number((100*n/denominator).toFixed(3)),unit:"percent",
    source_note:"Pesquisa voluntária com egressos; população de referência não informada.",
    methodology_note:methodology,verified_at:verifiedAt,
    state:"draft",published_at:null
   }));
  }
 }
 return Object.freeze({
  status:"draft",course,surveyId,instrumentVersion,periodLabel,
  eligibleMetrics:Object.keys(BINARY_FIELDS),
  rows:entries,
  // Não devolver respostas individuais nem contagens inferiores a cinco.
  disclosure:"Revisão humana obrigatória antes de qualquer publicação."
 });
}
