#!/usr/bin/env python3
"""Verificação conservadora de links das revistas; não edita o catálogo público."""
import argparse
import datetime as dt
import html
import json
import re
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = ROOT / "revistas.html"
MAX_URLS = 35
TIMEOUT_SECONDS = 8
USER_AGENT = "GASTROIFF-LinkAudit/1.0 (+https://gustavoguterman-gif.github.io/gastroiff/)"

def catalog_urls(source):
    """Seleciona apenas links editoriais originais do catálogo, não atalhos de tradução/mapa."""
    result = []
    for url in re.findall(r'href=["\'](https?://[^"\']+)["\']', source, re.I):
        url = html.unescape(url)
        parts = urlsplit(url)
        host = (parts.hostname or "").lower()
        if not host or host in {"translate.google.com", "www.google.com", "google.com"}:
            continue
        if host in {"portal1.iff.edu.br", "portal2015.iff.edu.br"}:
            continue
        if url not in result:
            result.append(url)
    return result[:MAX_URLS]

def classify(status=None, error=None):
    if status is not None and 200 <= status < 400:
        return "acessivel"
    if status in (404, 410):
        return "nao_encontrado_nesta_consulta"
    if status in (401, 403, 429):
        return "bloqueado_ou_limitado"
    if status is not None and status >= 500:
        return "falha_temporaria"
    return "inconclusivo" if error else "exige_revisao"

def check(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT}, method="HEAD")
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            status = response.status
            return {"url": url, "codigo_http": status, "situacao": classify(status),
                    "destino": response.geturl()}
    except urllib.error.HTTPError as exc:
        # HEAD não aceito: uma consulta GET limitada evita classificar indevidamente como erro.
        if exc.code == 405:
            try:
                req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT,
                    "Range": "bytes=0-1023"}, method="GET")
                with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as response:
                    return {"url": url, "codigo_http": response.status,
                            "situacao": classify(response.status), "destino": response.geturl()}
            except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as get_exc:
                code = get_exc.code if isinstance(get_exc, urllib.error.HTTPError) else None
                return {"url": url, "codigo_http": code,
                        "situacao": classify(code, str(type(get_exc).__name__))}
        return {"url": url, "codigo_http": exc.code, "situacao": classify(exc.code)}
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        return {"url": url, "codigo_http": None, "situacao": classify(error=str(type(exc).__name__))}

def run(source):
    urls = catalog_urls(source)
    return {"versao": 1, "consultado_em_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
            "total": len(urls), "conferencias": [check(url) for url in urls],
            "observacao": "Relatório técnico. Não comprova encerramento editorial nem altera o catálogo."}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=ROOT / "reports" / "saude-revistas.json")
    args = parser.parse_args()
    report = run(args.input.read_text(encoding="utf-8"))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(f"Conferidas {report['total']} URLs; relatório em {args.output}")

if __name__ == "__main__":
    main()
