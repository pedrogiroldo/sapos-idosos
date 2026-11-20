package com.saposidosos.protecao

enum class Regra { AVISAR, BLOQUEAR }

sealed class Decisao {
  object Permitir : Decisao()
  data class Avisar(val numero: String, val tipo: String) : Decisao()
  data class Bloquear(val numero: String, val tipo: String) : Decisao()
}

fun decidir(
  numeroBruto: String?,
  base: Map<String, String>,
  regra: Regra,
  podeAvisar: Boolean,
): Decisao {
  val numero = Numero.normalizar(numeroBruto) ?: return Decisao.Permitir
  val tipo = base[numero] ?: return Decisao.Permitir
  return when (regra) {
    Regra.BLOQUEAR -> Decisao.Bloquear(numero, tipo)
    Regra.AVISAR -> if (podeAvisar) Decisao.Avisar(numero, tipo) else Decisao.Permitir
  }
}
