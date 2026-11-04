#!/usr/bin/env python3
"""Monitor de fontes públicas explícitas. Candidatos não são anúncios aprovados."""
import argparse
import datetime as dt
import html
import json
import re
import unicodedata
import urllib.request
from pathlib import Path

SOURCE_URL = "https://bancodetalentos.grupojose.com.br/"
KEYWORDS = ("cozinha", "cozinheiro", "padeiro", "confeite", "pizzaiolo",
            "gastronom", "garcom", "restaurante", "barista", "chef", "copeiro",
            "estagio", "alimentos", "panific", "nutricao", "barman", "sommelier")
REGIONS = ("cabo frio", "arraial do cabo", "armacao dos buzios", "buzios",
           "sao pedro da aldeia", "araruama", "iguaba grande", "saquarema")
MAX_HTML_BYTES = 800_000
MAX_ITEMS = 80

def clean(value):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", value))).strip()

def norm(value):
    s = unicodedata.normalize("NFD", value.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")

def parse_grupo_jose(page, fetched_on):
    if 'class="card vaga-card"' not in page:
        raise ValueError("Estrutura de vagas desconhecida: revisão humana necessária")
    offers = []
    for section in page.split('class="card vaga-card"')[1:]:
        title = re.search(r'<h5\s+class="card-title"[^>]*>(.*?)</h5>', section, re.I | re.S)
        city = re.search(r'<div\s+class="vaga-location"[^>]*>.*?<span>(.*?)</span>', section, re.I | re.S)
        date = re.search(r'Publicada\s+em\s+(\d{2}/\d{2}/\d{4})', section, re.I)
        if not (title and city and date):
            continue
        title, city = clean(title.group(1)), clean(city.group(1))
        if not any(word in norm(title) for word in KEYWORDS):
            continue
        if not any(place in norm(city) for place in REGIONS):
            continue
        try:
            published = dt.datetime.strptime(date.group(1), "%d/%m/%Y").date()
        except ValueError:
            continue
        if published > dt.date.fromisoformat(fetched_on):
            continue
        key = norm(title + " " + city + " " + published.isoformat())
        offers.append({
            "id": "grupo-jose:" + re.sub(r"[^a-z0-9]+", "-", key).strip("-"),
            "cargo": title,
            "empresa": "Grupo José",
            "cidade": city,
            "modalidade": "Oportunidade profissional",
            "publicada_em": published.isoformat(),
            "consulta_em": fetched_on,
            "fonte": "Banco de Talentos do Grupo José",
            "url": SOURCE_URL,
            "situacao": "encontrada_na_fonte_nao_verificada_individualmente"
        })
        if len(offers) >= MAX_ITEMS:
            break
    # Uma consulta válida pode retornar zero vagas; isso não é uma falha de automação.
    return list({job["id"]: job for job in offers}.values())

def fetch(url):
    request = urllib.request.Request(url, headers={
        "User-Agent": "GASTROIFF-monitor-oportunidades/1.0 (consulta diaria; projeto educacional)",
        "Accept": "text/html"
    })
    with urllib.request.urlopen(request, timeout=20) as response:
        result = response.read(MAX_HTML_BYTES + 1)
        if len(result) > MAX_HTML_BYTES:
            raise ValueError("Fonte ultrapassa tamanho permitido")
        return result.decode("utf-8", errors="replace")

def build_state(previous, current, today):
    previous_ids = set(previous.get("ids_vistos", []))
    candidates = sorted(current, key=lambda j: (j["publicada_em"], j["cargo"]), reverse=True)
    # Persistir IDs conhecidos para não notificar novamente quando houver mudança de paginação.
    all_ids = sorted(previous_ids | {j["id"] for j in candidates})
    new = [j for j in candidates if j["id"] not in previous_ids]
    state = {"versao": 1, "ultima_consulta": today, "fonte": SOURCE_URL,
             "total_encontrado": len(candidates), "ids_vistos": all_ids,
             "candidatas": candidates}
    return state, new

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--saida", default="data/oportunidades-monitoradas.json")
    parser.add_argument("--resumo", default="/tmp/gastroiff-oportunidades-resumo.txt")
    parser.add_argument("--html", help="Página fictícia para testes locais")
    args = parser.parse_args()
    today = dt.datetime.now(dt.timezone(dt.timedelta(hours=-3))).date().isoformat()
    path = Path(args.saida)
    previous = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    page = Path(args.html).read_text(encoding="utf-8") if args.html else fetch(SOURCE_URL)
    current = parse_grupo_jose(page, today)
    state, new = build_state(previous, current, today)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # Somente fonte e links oficiais, nenhuma informação individual do candidato.
    summary = [f"Consulta em {today}: {len(current)} oportunidades compatíveis; {len(new)} registros novos.",
               "São registros encontrados na fonte, NÃO vagas individualmente confirmadas."]
    summary += [f"* {j['cargo']} | {j['cidade']} | {j['publicada_em']} | {j['url']}" for j in new]
    Path(args.resumo).write_text("\n".join(summary) + "\n", encoding="utf-8")
    print(summary[0])

if __name__ == "__main__":
    main()
