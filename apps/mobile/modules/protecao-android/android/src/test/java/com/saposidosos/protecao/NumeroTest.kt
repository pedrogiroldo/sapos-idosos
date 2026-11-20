package com.saposidosos.protecao

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class NumeroTest {
  @Test fun mantemE164() = assertEquals("+5511987654321", Numero.normalizar("+5511987654321"))
  @Test fun prefixaPais() = assertEquals("+5511987654321", Numero.normalizar("11987654321"))
  @Test fun ignoraFormatacao() = assertEquals("+5511987654321", Numero.normalizar("(11) 98765-4321"))
  @Test fun tiraZeroInicial() = assertEquals("+5511987654321", Numero.normalizar("011987654321"))
  @Test fun tiraZeroEOperadora() = assertEquals("+5511987654321", Numero.normalizar("01511987654321"))
  @Test fun fixo() = assertEquals("+551133334444", Numero.normalizar("1133334444"))
  @Test fun nulo() = assertNull(Numero.normalizar(null))
  @Test fun vazio() = assertNull(Numero.normalizar(""))
  @Test fun curtoDemais() = assertNull(Numero.normalizar("12345"))
}
