package com.saposidosos.protecao

import org.junit.Assert.assertEquals
import org.junit.Test

class DecisaoTest {
  private val base = mapOf("+5511900000001" to "falso_banco")

  @Test fun foraDaBasePermite() =
    assertEquals(Decisao.Permitir, decidir("+5511999999999", base, Regra.AVISAR, true))

  @Test fun naBaseAvisa() =
    assertEquals(
      Decisao.Avisar("+5511900000001", "falso_banco"),
      decidir("+5511900000001", base, Regra.AVISAR, true),
    )

  @Test fun naBaseBloqueia() =
    assertEquals(
      Decisao.Bloquear("+5511900000001", "falso_banco"),
      decidir("+5511900000001", base, Regra.BLOQUEAR, true),
    )

  @Test fun semPermissaoDeAvisarNaoSilencia() =
    assertEquals(Decisao.Permitir, decidir("+5511900000001", base, Regra.AVISAR, false))

  @Test fun numeroOcultoPermite() =
    assertEquals(Decisao.Permitir, decidir(null, base, Regra.BLOQUEAR, true))

  @Test fun formatoDiferenteDaBaseReconhece() =
    assertEquals(
      Decisao.Avisar("+5511900000001", "falso_banco"),
      decidir("11900000001", base, Regra.AVISAR, true),
    )
}
