#!/usr/bin/env python3
"""Monitor leve de fontes institucionais públicas. Apenas relatório; não altera site."""
import argparse
import datetime as dt
from html.parser import HTMLParser
import hashlib
import json
from pathlib import Path
import re
import unicodedata
import urllib.error
import urllib.request
from urllib.parse import urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "dados" / "fontes-institucionais.json"
MAX_RESPONSE = 350_000
TIMEOUT = 10
AGENT = "GASTROIFF-Fontes/1.0 (+https://gustavoguterman-gif.github.io/gastroiff/)"

class ExternalRedirectError(Exception):
    """A fonte oficial tentou redirecionar a consulta para fora do IFF."""


def official_https(url):
    parts = urlsplit(url)
    host = (parts.hostname or "").lower()
    return parts.scheme == "https" and (host == "iff.edu.br" or host.endswith(".iff.edu.br"))


class IFFRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not official_https(newurl):
            raise ExternalRedirectError("redirecionamento externo ou sem HTTPS")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


class AnchorParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []
    def handle_starttag(self, tag, attrs):
        if tag.lower() != "a":
            return
        for key, value in attrs:
            if key.lower() == "href" and value:
                self.hrefs.append(value)

def normalized(value):
    value = unicodedata.normalize("NFKD", value)
    return "".join(ch for ch in value if not unicodedata.combining(ch)).lower()

def calendar_candidates(html_text, base):
    parser = AnchorParser()
    parser.feed(html_text)
    found = []
    for href in parser.hrefs:
        u = urljoin(base, href)
        parsed = urlsplit(u)
        if parsed.scheme not in ("http", "https"):
            continue
        host = (parsed.hostname or "").lower()
        if host != "iff.edu.br" and not host.endswith(".iff.edu.br"):
            continue
        if "calendario" not in normalized(parsed.path):
            continue
        if u not in found:
            found.append(u)
    return found[:40]

def relevant(source, day):
    if source["cadence"] == "weekly":
        return True
    if source["cadence"] == "monthly":
        return day.day <= 7
    raise ValueError("Cadência não reconhecida")

def validate_sources(data):
    assert data["version"] == 1
    ids = set()
    for s in data["sources"]:
        assert s["id"] not in ids
        ids.add(s["id"])
        parsed = urlsplit(s["url"])
        host = (parsed.hostname or "").lower()
        assert official_https(s["url"])
        assert s["cadence"] in ("weekly", "monthly")
    return data["sources"]

def inspect(source):
    url = source["url"]
    method = "GET" if source.get("discovery") else "HEAD"
    req = urllib.request.Request(url, headers={"User-Agent": AGENT}, method=method)
    try:
        opener = urllib.request.build_opener(IFFRedirectHandler())
        with opener.open(req, timeout=TIMEOUT) as response:
            body = response.read(MAX_RESPONSE + 1) if method == "GET" else b""
            if len(body) > MAX_RESPONSE:
                return {"id": source["id"], "status": "revisao", "motivo": "html maior que limite"}
            out = {"id": source["id"], "status": "acessivel", "http": response.status,
                   "url_final": response.geturl(),
                   "etag": response.headers.get("ETag"),
                   "ultima_modificacao_http": response.headers.get("Last-Modified")}
            if method == "GET":
                text = body.decode("utf-8", errors="replace")
                out["sha256_pagina"] = hashlib.sha256(body).hexdigest()
                out["links_calendario_encontrados"] = calendar_candidates(text, response.geturl())
            return out
    except ExternalRedirectError:
        return {"id": source["id"], "status": "redirecionamento_externo_bloqueado"}
    except urllib.error.HTTPError as exc:
        code = exc.code
        state = "bloqueado_ou_limitado" if code in (401, 403, 429) else (
            "nao_encontrado_nesta_consulta" if code in (404, 410) else "falha_temporaria")
        return {"id": source["id"], "status": state, "http": code}
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        return {"id": source["id"], "status": "inconclusivo", "falha": type(exc).__name__}

def run(registry, day, include_monthly=False):
    sources = validate_sources(registry)
    selected = [s for s in sources if include_monthly or relevant(s, day)]
    return {"consultado_em_utc": dt.datetime.now(dt.timezone.utc).isoformat(), "cadencias": ["weekly"] +
      (["monthly"] if include_monthly or day.day <= 7 else []),
      "total": len(selected), "resultados": [inspect(s) for s in selected],
      "nota": "Apenas consulta técnica. Retificações devem ser confirmadas no documento oficial."}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--registry", type=Path, default=REGISTRY)
    parser.add_argument("--output", type=Path, default=ROOT/"reports"/"fontes-institucionais.json")
    parser.add_argument("--all", action="store_true", help="Incluir fontes mensais na execução manual")
    args = parser.parse_args()
    registry = json.loads(args.registry.read_text(encoding="utf-8"))
    report = run(registry, dt.date.today(), args.all)
    args.output.parent.mkdir(exist_ok=True, parents=True)
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False)+"\n", encoding="utf-8")
    print("Fontes institucionais consultadas:", report["total"])

if __name__ == "__main__":
    main()
