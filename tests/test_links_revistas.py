import unittest
from scripts.verificar_links_revistas import catalog_urls, classify

class LinkAuditTests(unittest.TestCase):
    def test_extrai_somente_origem_e_nao_traducao(self):
        page = """<a href="https://revistas.ufrj.br/index.php/mangut/">Revista</a>
        <a href="https://translate.google.com/translate?u=foo">Traduzir</a>
        <a href="https://portal1.iff.edu.br/nossos-campi/cabo-frio">IFF</a>
        <a href="https://revistas.ufrj.br/index.php/mangut/">Repetido</a>
        <a href="https://revistas.ifpr.edu.br/index.php/rcagt">IFPR</a>"""
        self.assertEqual(catalog_urls(page), [
            "https://revistas.ufrj.br/index.php/mangut/",
            "https://revistas.ifpr.edu.br/index.php/rcagt"])
    def test_falhas_de_acesso_nao_inferem_extincao_da_revista(self):
        self.assertEqual(classify(404), "nao_encontrado_nesta_consulta")
        self.assertEqual(classify(403), "bloqueado_ou_limitado")
        self.assertEqual(classify(429), "bloqueado_ou_limitado")
        self.assertEqual(classify(503), "falha_temporaria")
        self.assertEqual(classify(error="timeout"), "inconclusivo")
        self.assertEqual(classify(200), "acessivel")
    def test_limite_de_enderecos(self):
        links = "".join(f'<a href="https://revistas{i}.example.org/journal">x</a>' for i in range(50))
        self.assertEqual(len(catalog_urls(links)), 35)

if __name__ == "__main__":
    unittest.main()
