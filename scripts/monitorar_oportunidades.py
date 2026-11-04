#!/usr/bin/env python3
"""Monitor de fontes públicas explícitas. Candidatos não são anúncios aprovados."""
import argparse
import datetime as dt
import html
import json
import re
import unicodedata
import urllib.request
import time
from urllib.parse import urlsplit, urljoin
from pathlib import Path

SOURCE_URL = "https://bancodetalentos.grupojose.com.br/"
SOURCE_BZ = "https://grupobzbuzios.rhgestor.com.br/vagas"
SOURCES = (SOURCE_URL, SOURCE_BZ)
KEYWORDS = ("cozinha", "cozinheiro", "padeiro", "confeite", "pizzaiolo",
            "gastronom", "garcom", "restaurante", "barista", "chef", "copeiro",
            "estagio", "alimentos", "panific", "nutricao", "barman", "sommelier")
REGIONS = ("cabo frio", "arraial do cabo", "armacao dos buzios", "buzios",
           "sao pedro da aldeia", "araruama", "iguaba grande", "saquarema")
MAX_HTML_BYTES = 800_000
MAX_ITEMS = 80
MAX_AGE_DAYS = 30

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

def parse_grupo_bz(page, fetched_on):
    if 'class="item-vaga col-md-6"' not in page:
        raise ValueError("Estrutura de vagas do Grupo BZ desconhecida")
    offers = []
    for part in page.split('class="item-vaga col-md-6"')[1:]:
        title = re.search(r'<h5[^>]*>.*?<a\s+href="([^"]+)"[^>]*>.*?<strong[^>]*>(.*?)</strong>', part, re.I | re.S)
        city = re.search(r'<div\s+class="localizacao-vaga[^"]*"[^>]*>(.*?)</div>', part, re.I | re.S)
        if not title or not city:
            continue
        link, role, locality = html.unescape(title.group(1)), clean(title.group(2)), clean(city.group(1))
        link = urljoin(SOURCE_BZ, link)
        parsed = urlsplit(link)
        if parsed.scheme != "https" or parsed.netloc != "grupobzbuzios.rhgestor.com.br" or not parsed.path.startswith("/vagas/detalhes/"):
            continue
        if not any(word in norm(role) for word in KEYWORDS):
            continue
        if not any(place in norm(locality) for place in REGIONS):
            continue
        slug = parsed.path.rsplit("/", 1)[-1]
        if not re.fullmatch(r"[A-Za-z0-9_-]{6,100}", slug):
            continue
        offers.append({
            "id": "grupo-bz:" + slug,
            "cargo": role, "empresa": "Grupo BZ", "cidade": locality,
            "modalidade": "Oportunidade profissional",
            "publicada_em": None, "consulta_em": fetched_on,
            "fonte": "Portal de recrutamento do Grupo BZ",
            "url": link,
            "situacao": "encontrada_na_fonte_nao_verificada_individualmente"
        })
    return list({x["id"]: x for x in offers}.values())


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

def fetch_validated(url, marker, attempts=3):
    last_error = None
    for attempt in range(attempts):
        try:
            document = fetch(url)
            if marker in document:
                return document
            last_error = ValueError("A fonte respondeu sem os cartões de vagas esperados")
        except (OSError, ValueError) as error:
            last_error = error
        if attempt + 1 < attempts:
            time.sleep(2 * (attempt + 1))
    raise ValueError("A fonte não pôde ser verificada após tentativas: " + url) from last_error


def build_state(previous, current, today):
    previous_ids = set(previous.get("ids_vistos", []))
    # Preservar IDs históricos para não reabrir uma vaga antiga como novidade.
    all_ids = sorted(previous_ids | {j["id"] for j in current})
    reference = dt.date.fromisoformat(today)
    candidates = [
        j for j in current
        if j.get("publicada_em") is None or
        0 <= (reference - dt.date.fromisoformat(j["publicada_em"])).days <= MAX_AGE_DAYS
    ]
    candidates = sorted(candidates, key=lambda j: (j.get("publicada_em") or "", j["cargo"]), reverse=True)
    new = [j for j in candidates if j["id"] not in previous_ids]
    state = {"versao": 1, "ultima_consulta": today, "fonte": SOURCE_URL,
             "total_encontrado": len(candidates), "ids_vistos": all_ids,
             "fontes": list(SOURCES),
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
    if args.html:
        current = parse_grupo_jose(Path(args.html).read_text(encoding="utf-8"), today)
    else:
        jose_html = fetch_validated(SOURCE_URL, 'class="card vaga-card"')
        bz_html = fetch_validated(SOURCE_BZ, 'class="item-vaga col-md-6"')
        jose_rows = parse_grupo_jose(jose_html, today)
        bz_rows = parse_grupo_bz(bz_html, today)
        print("Diagnóstico da fonte Grupo José:", len(jose_html), "caracteres,",
              jose_html.count('class="card vaga-card"'), "cartões,", len(jose_rows), "itens gastronômicos")
        print("Diagnóstico da fonte Grupo BZ:", len(bz_html), "caracteres,",
              bz_html.count('class="item-vaga col-md-6"'), "cartões,", len(bz_rows), "itens gastronômicos")
        if not bz_rows and 'class="item-vaga col-md-6"' in bz_html:
            found_locations = re.findall(
                r'<div\\s+class="localizacao-vaga[^"]*"[^>]*>(.*?)</div>', bz_html, re.I | re.S)
            print("Amostras de localização do Grupo BZ:", [clean(s)[:80] for s in found_locations[:3]])
            sample = bz_html.split('class="item-vaga col-md-6"')[1]
            print("Primeira ficha BZ, HTML reduzido:", repr(sample[:1000]))
            print("Indicadores de localidade na ficha:", "Búzios" in sample, "Buzios" in sample)
        current = jose_rows + bz_rows
    state, new = build_state(previous, current, today)
    state["encontradas_por_fonte"] = {
        "Grupo José": sum(j["empresa"] == "Grupo José" for j in current),
        "Grupo BZ": sum(j["empresa"] == "Grupo BZ" for j in current)
    }
    print("Itens por fonte:", state["encontradas_por_fonte"],
          "| Recentes após filtro de recência:", state["total_encontrado"])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # Somente fonte e links oficiais, nenhuma informação individual do candidato.
    summary = [f"Consulta em {today}: {len(current)} oportunidades compatíveis; {len(new)} registros novos.",
               "São registros encontrados na fonte, NÃO vagas individualmente confirmadas."]
    summary += [f"* {j['cargo']} | {j['cidade']} | {j['publicada_em'] or 'data não informada'} | {j['url']}" for j in new]
    Path(args.resumo).write_text("\n".join(summary) + "\n", encoding="utf-8")
    print(summary[0])

if __name__ == "__main__":
    main()
