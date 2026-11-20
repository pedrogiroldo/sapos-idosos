package com.saposidosos.protecao

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONObject

/**
 * Base de números de golpe: embutida no app + baixada do servidor + números de teste.
 * Guardada em SharedPreferences (`protecao_base`) para o serviço de triagem ler sem a UI.
 */
class BaseLocal(
  private val prefs: SharedPreferences,
  private val embutida: Map<String, String>,
) {
  fun numeros(): Map<String, String> = embutida + ler(CHAVE_NUMEROS) + ler(CHAVE_TESTE)

  fun gravar(numeros: Map<String, String>, versao: Int) {
    prefs.edit()
      .putString(CHAVE_NUMEROS, JSONObject(numeros).toString())
      .putInt(CHAVE_VERSAO, versao)
      .commit()
  }

  fun adicionarTeste(numero: String, tipo: String) {
    val teste = ler(CHAVE_TESTE) + (numero to tipo)
    prefs.edit().putString(CHAVE_TESTE, JSONObject(teste).toString()).commit()
  }

  fun versao(): Int = prefs.getInt(CHAVE_VERSAO, 0)

  var regra: Regra
    get() = prefs.getString(CHAVE_REGRA, null)
      ?.let { nome -> Regra.values().firstOrNull { it.name == nome } }
      ?: Regra.AVISAR
    set(valor) {
      prefs.edit().putString(CHAVE_REGRA, valor.name).commit()
    }

  private fun ler(chave: String): Map<String, String> {
    val texto = prefs.getString(chave, null) ?: return emptyMap()
    return try {
      val json = JSONObject(texto)
      json.keys().asSequence().associateWith { json.getString(it) }
    } catch (e: Exception) {
      emptyMap()
    }
  }

  companion object {
    const val ARQUIVO = "protecao_base"
    private const val CHAVE_NUMEROS = "numeros"
    private const val CHAVE_TESTE = "teste"
    private const val CHAVE_VERSAO = "versao"
    private const val CHAVE_REGRA = "regra"

    fun abrir(context: Context, embutida: Map<String, String>) =
      BaseLocal(context.getSharedPreferences(ARQUIVO, Context.MODE_PRIVATE), embutida)
  }
}
