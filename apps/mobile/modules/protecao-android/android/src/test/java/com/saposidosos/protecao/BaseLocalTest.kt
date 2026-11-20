package com.saposidosos.protecao

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class BaseLocalTest {
  private val embutida = mapOf("+5511900000001" to "falso_banco")

  @Test fun semNadaGravadoDevolveSoEmbutida() {
    assertEquals(embutida, BaseLocal(FakePrefs(), embutida).numeros())
  }

  @Test fun gravarEAdicionarTesteFazemUniao() {
    val base = BaseLocal(FakePrefs(), embutida)
    base.gravar(mapOf("+5511900000002" to "pix_urgente"), 3)
    base.adicionarTeste("+5511900000003", "outro")
    assertEquals(
      mapOf(
        "+5511900000001" to "falso_banco",
        "+5511900000002" to "pix_urgente",
        "+5511900000003" to "outro",
      ),
      base.numeros(),
    )
    assertEquals(3, base.versao())
  }

  @Test fun jsonInvalidoUsaEmbutida() {
    val prefs = FakePrefs()
    prefs.dados["numeros"] = "{quebrado"
    assertEquals(embutida, BaseLocal(prefs, embutida).numeros())
  }

  @Test fun regraPadraoEAvisar() {
    assertEquals(Regra.AVISAR, BaseLocal(FakePrefs(), embutida).regra)
  }

  @Test fun regraPersiste() {
    val prefs = FakePrefs()
    BaseLocal(prefs, embutida).regra = Regra.BLOQUEAR
    assertEquals(Regra.BLOQUEAR, BaseLocal(prefs, embutida).regra)
  }

  @Test fun adicionarTesteNormalizaONumero() {
    val base = BaseLocal(FakePrefs(), embutida)
    base.adicionarTeste("(11) 98765-4321", "falso_banco")
    assertEquals("falso_banco", base.numeros()["+5511987654321"])
    assertFalse(base.numeros().containsKey("(11) 98765-4321"))
  }

  @Test fun adicionarTesteIgnoraNumeroInvalido() {
    val base = BaseLocal(FakePrefs(), embutida)
    base.adicionarTeste("123", "outro")
    assertEquals(embutida, base.numeros())
  }

  @Test fun gravarNormalizaChavesEIgnoraInvalidas() {
    val base = BaseLocal(FakePrefs(), embutida)
    base.gravar(mapOf("11 3333-4444" to "pix_urgente", "abc" to "outro"), 2)
    assertEquals(
      mapOf("+5511900000001" to "falso_banco", "+551133334444" to "pix_urgente"),
      base.numeros(),
    )
  }
}
