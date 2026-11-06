#!/usr/bin/env python3
"""Verificações estáticas de regressão da página de contato GASTROIFF."""
from pathlib import Path
from html.parser import HTMLParser
import re

ROOT = Path(__file__).resolve().parents[1]


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.classes = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a":
            self.links.append(attrs.get("href", ""))
        if "class" in attrs:
            self.classes.extend(attrs["class"].split())


def check():
    contact = (ROOT / "contato.html").read_text(encoding="utf-8")
    home = (ROOT / "index.html").read_text(encoding="utf-8")
    cp, hp = Links(), Links()
    cp.feed(contact)
    hp.feed(home)

    assert "tel:+552226459500" in cp.links, "Link de ligação ausente"
    assert "https://wa.me/552226459500" in cp.links, "Link WhatsApp ausente"
    assert "linha exclusiva" not in contact.lower(), "Texto indevido reapareceu"
    for name in ("gi-nav-dropdown", "gi-nav-list", "gi-mobile-resources", "mobile-menu"):
        assert name in cp.classes, f"Componente ausente em contato: {name}"
        assert name in hp.classes, f"Componente ausente na página inicial: {name}"
    for name in ("site.css", "refinements.css", "institutional.css", "site.js"):
        pattern = rf'assets/{re.escape(name)}\\?v=([^"\\s]+)'
        a, b = re.search(pattern, contact), re.search(pattern, home)
        assert a and b and a.group(1) == b.group(1), f"Versões divergentes: {name}"
    assert "@media(max-width:400px)" in contact, "Regra para telas estreitas ausente"
    assert 'grid-template-columns:1fr' in contact, "Ações devem empilhar em telas estreitas"
    print("OK: contato, WhatsApp, navegação e regras responsivas básicas")


if __name__ == "__main__":
    check()
