import datetime as dt
import json
import unittest
from scripts.monitorar_oportunidades import parse_grupo_jose, build_state

DATE = "2026-11-04"
HTML = """
<html><div class="card vaga-card">
<h5 class="card-title">Ajudante de padeiro</h5>
<div class="vaga-location"><i></i><span>Cabo Frio</span></div>
<div class="vaga-meta"><span>Publicada em 20/10/2026</span></div>
</div><div class="card vaga-card">
<h5 class="card-title">Analista financeiro</h5>
<div class="vaga-location"><span>Cabo Frio</span></div>
<div class="vaga-meta"><span>Publicada em 21/10/2026</span></div>
</div><div class="card vaga-card">
<h5 class="card-title">Confeiteiro(a)</h5>
<div class="vaga-location"><span>Arraial do Cabo</span></div>
<div class="vaga-meta"><span>Publicada em 28/10/2026</span></div>
</div>
"""
class MonitorTests(unittest.TestCase):
    def test_extrai_vagas_de_gastronomia_com_fonte(self):
        result = parse_grupo_jose(HTML, DATE)
        self.assertEqual(len(result), 2)
        self.assertTrue(all(j["url"].startswith("https://bancodetalentos.grupojose.com.br/") for j in result))
        self.assertTrue(all("nao_verificada" in j["situacao"] for j in result))
    def test_deduplicacao_na_segunda_execucao(self):
        result = parse_grupo_jose(HTML, DATE)
        state, first = build_state({}, result, DATE)
        self.assertEqual(len(first), 2)
        later, second = build_state(state, result, DATE)
        self.assertEqual(second, [])
        self.assertEqual(later["total_encontrado"], 2)
    def test_nao_publica_vagas_de_outra_regiao(self):
        page = HTML.replace("Cabo Frio","Curitiba").replace("Arraial do Cabo","Curitiba")
        self.assertEqual(parse_grupo_jose(page, DATE), [])
    def test_nao_inventa_dados_quando_layout_muda(self):
        with self.assertRaises(ValueError):
            parse_grupo_jose("<main>Não há dados estruturados</main>", DATE)
    def test_data_futura_recusada(self):
        page = HTML.replace("2026","2027")
        self.assertEqual(parse_grupo_jose(page, DATE), [])
    def test_novidade_detectada_uma_vez(self):
        a = parse_grupo_jose(HTML, DATE)
        prev, _ = build_state({}, [a[0]], DATE)
        newer, newly_seen = build_state(prev, a, DATE)
        self.assertEqual(len(newly_seen), 1)
        self.assertEqual(len(newer["ids_vistos"]), 2)

if __name__ == "__main__":
    unittest.main()
