package com.saposidosos.protecao

object Numero {
  /** Devolve o número em E.164 (`+55...`) ou `null` se não parecer um número brasileiro. */
  fun normalizar(bruto: String?): String? {
    if (bruto == null) return null
    var d = bruto.filter { it.isDigit() }
    if (d.startsWith("0")) {
      d = when (d.length) {
        13, 14 -> d.substring(3) // 0 + operadora de 2 dígitos
        11, 12 -> d.substring(1)
        else -> return null
      }
    }
    return when {
      d.length in 10..11 -> "+55$d"
      d.length in 12..13 && d.startsWith("55") -> "+$d"
      else -> null
    }
  }
}
