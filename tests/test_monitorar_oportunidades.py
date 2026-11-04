import datetime as dt
import json
import unittest
from scripts.monitorar_oportunidades import parse_grupo_jose, parse_grupo_bz, build_state

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
BZ_HTML = """
<div class="item-vaga col-md-6"><div class="box hover"><h5>
<a href="/vagas/detalhes/F2Ucbz319700c7K9Qdx"><strong>COZINHEIRO DE RESTAURANTE</strong></a>
</h5><div class="localizacao-vaga corprincipal cor-detalhe"><i></i> Armação dos Búzios - RJ</div></div></div>
<div class="item-vaga col-md-6"><h5><a href="https://evil.invalid/vagas/detalhes/123456"><strong>CHEFE DE COZINHA</strong></a></h5>
<div class="localizacao-vaga corprincipal">Armação dos Búzios - RJ</div></div>
"""

class MonitorTests(unittest.TestCase):
    def test_anuncios_antigos_nao_aparecem_como_vagas_recentes(self):
        rows = parse_grupo_jose(HTML.replace("20/10/2026", "20/07/2026"), DATE)
        state, alerts = build_state({}, rows, DATE)
        self.assertEqual(len(alerts), 1)
        self.assertEqual(len(state["ids_vistos"]), 2)
        self.assertTrue(all(item["publicada_em"] >= "2026-10-05" for item in state["candidatas"]))
        # Mesmo quando reaparece em consulta posterior, o item antigo não gera alerta novo.
        after, second_alerts = build_state(state, rows, DATE)
        self.assertEqual(len(second_alerts), 0)
    def test_vaga_sem_data_pode_ter_link_individual_mas_exige_conferencia(self):
        bz = parse_grupo_bz(BZ_HTML, DATE)
        state, new = build_state({}, bz, DATE)
        self.assertEqual(len(new), 1)
        self.assertEqual(state["candidatas"][0]["publicada_em"], None)
    def test_grupo_bz_filtra_link_e_cidade_verdadeiros(self):
        rows = parse_grupo_bz(BZ_HTML, DATE)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["cargo"], "COZINHEIRO DE RESTAURANTE")
        self.assertTrue(rows[0]["url"].startswith("https://grupobzbuzios.rhgestor.com.br/vagas/detalhes/"))
        self.assertIsNone(rows[0]["publicada_em"])
    def test_grupo_bz_rejeita_endereco_relativo_que_aponta_para_outro_dominio(self):
        html = BZ_HTML.replace('/vagas/detalhes/F2Ucbz319700c7K9Qdx',
                               'https://evil.invalid/vagas/detalhes/F2Ucbz319700c7K9Qdx')
        self.assertEqual(parse_grupo_bz(html, DATE), [])
    def test_grupo_bz_estrutura_ausente_exige_revisao(self):
        with self.assertRaises(ValueError):
            parse_grupo_bz("<main>sem cards</main>", DATE)
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
