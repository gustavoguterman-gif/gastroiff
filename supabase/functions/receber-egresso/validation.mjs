// Somente dados predefinidos entram no questionário. Nenhum dado de identidade.
export class SurveyInputError extends Error {
 constructor(message,status=400){super(message);this.name="SurveyInputError";this.status=status;}
}
const SCHEMA={
 technical:{
  cohort:["before_2015","2015_2019","2020_2023","2024_onward","prefer_not"],
  working:["yes","no","prefer_not"],
  gastronomy_work:["yes","no","not_applicable","prefer_not"],
  study_continuity:["yes","no","prefer_not"],
  training_rating:["very_good","good","fair","poor","prefer_not"]
 },
 technologist:{
  cohort:["before_2015","2015_2019","2020_2023","2024_onward","prefer_not"],
  working:["yes","no","prefer_not"],
  gastronomy_work:["yes","no","not_applicable","prefer_not"],
  study_continuity:["yes","no","prefer_not"],
  training_rating:["very_good","good","fair","poor","prefer_not"],
  research_extension:["yes","no","prefer_not"]
 }
};
export const MAX_BODY_BYTES=4096;
export function validateSurveySubmission(input){
 if(!input||typeof input!=="object"||Array.isArray(input))
  throw new SurveyInputError("Dados do formulário inválidos.");
 const keys=Object.keys(input);
 if(keys.some(k=>!["surveyId","course","instrumentVersion","invitationToken","consent","answers","challengeToken"].includes(k)))
  throw new SurveyInputError("Campo desconhecido no formulário.");
 if(typeof input.surveyId!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.surveyId))
  throw new SurveyInputError("Pesquisa inválida.");
 if(!Object.hasOwn(SCHEMA,input.course))
  throw new SurveyInputError("Curso inválido.");
 if(!Number.isSafeInteger(input.instrumentVersion)||input.instrumentVersion<1||input.instrumentVersion>100)
  throw new SurveyInputError("Versão de questionário inválida.");
 if(typeof input.invitationToken!=="string"||!/^[A-Za-z0-9_-]{43}$/.test(input.invitationToken))
  throw new SurveyInputError("Convite inválido.");
 if(input.consent!==true)throw new SurveyInputError("É necessário confirmar a participação.");
 if(typeof input.challengeToken!=="string"||input.challengeToken.length<10||input.challengeToken.length>2048)
  throw new SurveyInputError("Verificação do formulário inválida.");
 const answers=input.answers,schema=SCHEMA[input.course];
 if(!answers||typeof answers!=="object"||Array.isArray(answers))
  throw new SurveyInputError("Respostas inválidas.");
 const entries=Object.entries(answers);
 if(entries.length<1||entries.length>Object.keys(schema).length)
  throw new SurveyInputError("Quantidade de respostas inválida.");
 const result={};
 for(const [key,value] of entries){
  if(!Object.hasOwn(schema,key)||typeof value!=="string"||!schema[key].includes(value))
   throw new SurveyInputError("Resposta fora das opções do questionário.");
  result[key]=value;
 }
 return {
  surveyId:input.surveyId.toLowerCase(),course:input.course,
  instrumentVersion:input.instrumentVersion,
  invitationToken:input.invitationToken,challengeToken:input.challengeToken,
  answers:result
 };
}
