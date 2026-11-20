package com.saposidosos.protecao

import org.junit.Assert.assertEquals
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
}
