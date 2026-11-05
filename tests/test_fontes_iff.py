import datetime as dt
import unittest
from unittest.mock import patch
from scripts.verificar_fontes_iff import calendar_candidates, normalized, relevant, run, validate_sources

class AcademicSourceTests(unittest.TestCase):
    def test_links_do_calendario_somente_iff_e_sem_duplicidade(self):
        html = '''<a href="/nossos-campi/cabo-frio/calendario_2026.pdf">Atual</a>
        <a href="https://site-terceiro.com/calendario_2027.pdf">Outro</a>
        <a href="/nossos-campi/cabo-frio/calendario_2026.pdf">Repetido</a>
        <a href="/nossos-campi/cabo-frio/documentos.pdf">Não é calendário</a>'''
        self.assertEqual(calendar_candidates(html, "https://portal1.iff.edu.br/"),
            ["https://portal1.iff.edu.br/nossos-campi/cabo-frio/calendario_2026.pdf"])
    def test_acentos_na_url(self):
        self.assertIn("calendario", normalized("Calendário Acadêmico"))
    def test_cadencia_mensal_na_primeira_semana(self):
        source = {"cadence": "monthly"}
        self.assertTrue(relevant(source, dt.date(2026, 11, 5)))
        self.assertFalse(relevant(source, dt.date(2026, 11, 14)))
    def test_nao_aceita_url_externa(self):
        registry = {"version":1,"sources":[{"id":"x","url":"https://exemplo.net/outro","cadence":"weekly"}]}
        with self.assertRaises(AssertionError):
            validate_sources(registry)
    def test_nao_consulta_mensal_sem_necessidade(self):
        registry={"version":1,"sources":[
            {"id":"a","url":"https://portal1.iff.edu.br/a","cadence":"weekly"},
            {"id":"b","url":"https://portal1.iff.edu.br/b","cadence":"monthly"}]}
        with patch("scripts.verificar_fontes_iff.inspect",side_effect=lambda s:{"id":s["id"]}):
            r=run(registry,dt.date(2026,11,14))
        self.assertEqual(r["total"],1)
        self.assertEqual(r["resultados"],[{"id":"a"}])

if __name__=="__main__":
    unittest.main()
