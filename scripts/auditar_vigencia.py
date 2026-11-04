#!/usr/bin/env python3
"""Auditoria semanal dos dados de calendário publicados no GASTROIFF.

Não coleta oportunidades externas nem publica dados novos. Detecta situações
que pedem conferência editorial e escreve resumo para a gestão via GitHub.
"""
from datetime import date, timedelta
from pathlib import Path
import json
import os
import re

root = Path(__file__).resolve().parents[1]
raw = (root / "assets/events.js").read_text(encoding="utf-8")
match = re.search(r"window\.GASTROIFF_EVENTS\s*=\s*(\[[\s\S]*?\])\s*;", raw)
if not match:
    raise SystemExit("Não foi possível ler o catálogo editorial de eventos.")
events = json.loads(match.group(1))
today = date.today()
recent = today + timedelta(days=15)
problems = []
total_upcoming = 0

for event in events:
    title = event.get("name", "Sem título")
    start, end = event.get("start", ""), event.get("end") or event.get("start", "")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", start) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", end):
        problems.append(f"Evento com data incompleta: {title}")
        continue
    ending = date.fromisoformat(end)
    if ending < today:
        continue
    total_upcoming += 1
    if not event.get("site", "").startswith("https://"):
        problems.append(f"Falta link oficial: {title}")
    if not event.get("description"):
        problems.append(f"Falta descrição: {title}")
    if date.fromisoformat(start) <= recent:
        problems.append(f"Confirmar informações de evento próximo: {title} ({start})")

if total_upcoming == 0:
    problems.append("Nenhum evento futuro cadastrado. Pesquisar novas atividades e editais relevantes para o público.")

lines = [
    "# Conferência editorial GASTROIFF",
    "",
    f"Data da verificação automatizada: {today.isoformat()}",
    f"Eventos futuros no catálogo: {total_upcoming}",
    "",
    "Esta rotina verifica apenas datas e campos dos eventos existentes. "
    "Não confirma inscrições, não descobre eventos novos e não substitui a leitura das fontes oficiais.",
    "",
    "## Pontos para conferência",
]
lines.extend(f"- {problem}" for problem in problems)
(root / "relatorio-vigencia.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
output = os.environ.get("GITHUB_OUTPUT")
if output:
    with open(output, "a", encoding="utf-8") as handle:
        handle.write(f"pendencias={'true' if problems else 'false'}\n")
print("\n".join(lines))
