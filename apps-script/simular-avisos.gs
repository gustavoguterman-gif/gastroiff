/* GASTROIFF - modelo de automação do Google Apps Script.
 * Somente simulação: não envia e-mail, não altera planilhas, não cria gatilho.
 * Configurar GASTROIFF_SPREADSHEET_ID em Propriedades do script quando implantado.
 */
var GI_LEMBRETE_DIAS = 7;
var GI_ZONE = "America/Sao_Paulo";

function giISO(value) {
  if(value instanceof Date && !isNaN(value.valueOf())){
    return Utilities.formatDate(value,GI_ZONE,"yyyy-MM-dd");
  }
  var text=String(value===null||value===undefined?"":value).trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(text))return "";
  var date=new Date(text+"T12:00:00Z");
  return !isNaN(date.valueOf())&&date.toISOString().slice(0,10)===text?text:"";
}
function giDiasEntre(hoje,inicio) {
  var a=giISO(hoje),b=giISO(inicio);
  if(!a||!b)return null;
  return Math.round((Date.parse(b+"T12:00:00Z")-Date.parse(a+"T12:00:00Z"))/86400000);
}
function giCabecalhos(linhas,esperados){
  if(!Array.isArray(linhas)||!linhas.length)throw Error("A planilha está vazia.");
  var h=linhas[0].map(function(x){return String(x).trim().toLowerCase()});
  var map={};
  esperados.forEach(function(key){var i=h.indexOf(key);if(i<0)throw Error("Coluna não encontrada: "+key);map[key]=i});
  return map;
}
function giAvisosDeTeste(ciclos,insumos,hoje){
  var c=giCabecalhos(ciclos,["id_ciclo","curso","disciplina","docente","inicio","fim"]);
  var i=giCabecalhos(insumos,["id_ciclo","insumo_ou_material","situacao","fonte"]);
  var items={};
  insumos.slice(1).forEach(function(row){
    var id=String(row[i.id_ciclo]||"").trim();
    if(!id)return;
    if(!items[id])items[id]=[];
    items[id].push({nome:String(row[i.insumo_ou_material]||"").trim(),status:String(row[i.situacao]||"Não informado").trim()||"Não informado",fonte:String(row[i.fonte]||"").trim()});
  });
  var aviso=[];
  ciclos.slice(1).forEach(function(row){
    var id=String(row[c.id_ciclo]||"").trim();
    var start=giISO(row[c.inicio]);
    var diff=giDiasEntre(hoje,start);
    if(!id||diff===null||diff!==GI_LEMBRETE_DIAS)return;
    var records=items[id]||[];
    var pendencias=records.filter(function(x){return x.status!=="Recebido confirmado"||!x.fonte}).length;
    aviso.push({id:id,docente:String(row[c.docente]||"").trim(),disciplina:String(row[c.disciplina]||"").trim(),inicio:start,dias_ate_inicio:diff,itens:records.length,itens_para_conferir:pendencias});
  });
  return aviso;
}
function simularAvisosDocentes(){
  var id=PropertiesService.getScriptProperties().getProperty("GASTROIFF_SPREADSHEET_ID");
  if(!id)throw Error("Configure GASTROIFF_SPREADSHEET_ID nas propriedades privadas do Apps Script.");
  var sheet=SpreadsheetApp.openById(id);
  var ciclosTab=sheet.getSheetByName("Ciclos"),insumosTab=sheet.getSheetByName("Insumos");
  if(!ciclosTab||!insumosTab)throw Error("As abas Ciclos e Insumos são necessárias.");
  var linhasCiclos=ciclosTab.getDataRange().getValues();
  var linhasInsumos=insumosTab.getDataRange().getValues();
  var hoje=Utilities.formatDate(new Date(),GI_ZONE,"yyyy-MM-dd");
  var avisos=giAvisosDeTeste(linhasCiclos,linhasInsumos,hoje);
  Logger.log("SIMULAÇÃO. Nenhuma mensagem enviada. Data "+hoje+". Avisos possíveis: "+avisos.length);
  avisos.forEach(function(a){
    Logger.log(JSON.stringify(a));
  });
  return {hoje:hoje,total:avisos.length,simulacao:true};
}
