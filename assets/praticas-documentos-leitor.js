/* Leitura demonstrativa local de documentos. Reconhecimento não equivale a validação. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.GASTROIFF_DOCUMENTOS=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const MAX_BYTES=8*1024*1024,MAX_PAGES=6;
 const ext=name=>String(name||"").toLowerCase().match(/\.(xlsx|xls|csv|pdf|jpe?g|png|webp)$/)?.[1]||"";
 const flattened=matrix=>matrix.slice(0,150).map(row=>row.slice(0,20).map(v=>String(v??"").trim()).filter(Boolean).join(" | ")).filter(Boolean).join("\n").slice(0,16000);
 async function read(file,stage,libs={}){
  const type=ext(file?.name);
  if(!type)throw Error("Formato não aceito. Use Excel, CSV, PDF ou imagem JPEG/PNG/WebP.");
  if(!file.size||file.size>MAX_BYTES)throw Error("Arquivo vazio ou acima de 8 MB.");
  const result={name:file.name,stage,kind:type,rows:[],text:"",warnings:[],reviewed:false};
  if(["xlsx","xls"].includes(type)){
    if(!libs.XLSX||!libs.excel)throw Error("Leitor Excel indisponível.");
    const workbook=libs.excel.inspectWorkbook(await file.arrayBuffer(),libs.XLSX);
    for(const sheet of workbook.sheets){
      if(stage==="cronograma"){result.text+="Aba "+sheet.name+"\n"+flattened(sheet.matrix)+"\n";continue}
      if(sheet.detected?.score===3){
        try{
          const parsed=libs.excel.extract(sheet);
          result.rows.push(...parsed.rows);
          result.warnings.push(...parsed.warnings.map(s=>sheet.name+": "+s));
          result.text+="Aba "+sheet.name+"\n"+flattened(sheet.matrix)+"\n";
        }catch(error){result.warnings.push(sheet.name+": "+error.message)}
      }else{
        result.warnings.push("Aba "+sheet.name+": colunas de insumo, unidade e quantidade não identificadas. Revise na conferência de Excel.");
        result.text+="Aba "+sheet.name+"\n"+flattened(sheet.matrix)+"\n";
      }
    }
  }else if(type==="csv"){
    if(!libs.csv)throw Error("Leitor CSV indisponível.");
    const matrix=libs.csv.parseCsv(await file.text());
    result.text=flattened(matrix);
    if(stage!=="cronograma")result.warnings.push("CSV recebido como texto. Valide as colunas na conferência de insumos.");
  }else if(type==="pdf"){
    if(!libs.pdfjs?.getDocument)throw Error("Leitor PDF indisponível. Não foi possível analisar o arquivo.");
    const pdf=await libs.pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
    const limit=Math.min(pdf.numPages,MAX_PAGES);
    for(let i=1;i<=limit;i++){
      const page=await pdf.getPage(i);
      const contents=await page.getTextContent();
      let text=contents.items.map(x=>x.str||"").join(" ").trim();
      if(!text && libs.ocr?.recognize && libs.canvasFactory){
        const viewport=page.getViewport({scale:1.35}), canvas=libs.canvasFactory();
        canvas.width=Math.round(viewport.width);canvas.height=Math.round(viewport.height);
        await page.render({canvasContext:canvas.getContext("2d"),viewport}).promise;
        const response=await libs.ocr.recognize(canvas,"por");
        text=response?.data?.text||"";
        result.warnings.push("Página "+i+": texto identificado por OCR; confira manualmente.");
      }
      if(!text)result.warnings.push("Página "+i+": sem texto legível; envie imagem nítida ou registre manualmente.");
      result.text+="Página "+i+": "+text+"\n";
    }
    if(pdf.numPages>MAX_PAGES)result.warnings.push("PDF tem mais de seis páginas. Documento lido parcialmente.");
  }else{
    if(!libs.ocr?.recognize)throw Error("Reconhecimento de imagens indisponível. Não foi possível ler a imagem.");
    const response=await libs.ocr.recognize(file,"por");
    result.text=String(response?.data?.text||"").trim();
    if(!result.text)result.warnings.push("A imagem não apresentou texto legível.");
    else result.warnings.push("Texto de imagem reconhecido por OCR; é obrigatória a revisão humana.");
  }
  if(!result.text.trim()&&!result.rows.length)throw Error("Nenhuma informação legível encontrada.");
  result.text=result.text.slice(0,20000);
  return result;
 }
 return {read,ext,MAX_BYTES,MAX_PAGES,flattened};
});
