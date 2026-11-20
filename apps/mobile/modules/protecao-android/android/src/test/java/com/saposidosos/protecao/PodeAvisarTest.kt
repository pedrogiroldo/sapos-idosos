package com.saposidosos.protecao

import android.app.NotificationManager
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PodeAvisarTest {
  @Test fun tudoLigadoECanalAindaNaoCriadoAvisa() =
    assertTrue(podeAvisarCom(notificacoesAtivas = true, fsiPermitido = true, importanciaCanal = null))

  @Test fun canalComImportanciaAltaAvisa() =
    assertTrue(podeAvisarCom(true, true, NotificationManager.IMPORTANCE_HIGH))

  @Test fun notificacoesDesligadasNaoAvisa() =
    assertFalse(podeAvisarCom(false, true, null))

  @Test fun semTelaCheiaNaoAvisa() =
    assertFalse(podeAvisarCom(true, false, NotificationManager.IMPORTANCE_HIGH))

  @Test fun canalDesligadoNaoAvisa() =
    assertFalse(podeAvisarCom(true, true, NotificationManager.IMPORTANCE_NONE))
}
