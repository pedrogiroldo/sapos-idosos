package com.saposidosos.protecao

import android.content.Context
import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log
import org.json.JSONObject

/**
 * Chamado pelo Android a cada ligação recebida, enquanto o app tem o papel de triagem.
 * Precisa responder sempre e rápido; em qualquer erro, a ligação passa normalmente.
 */
class TriagemService : CallScreeningService() {
  override fun onScreenCall(details: Call.Details) {
    var resposta = permitir()
    try {
      if (details.callDirection != Call.Details.DIRECTION_INCOMING) return
      val base = base(this)
      val decisao = decidir(
        details.handle?.schemeSpecificPart,
        base.numeros(),
        base.regra,
        AlertaNotificacao.podeAvisar(this),
      )
      when (decisao) {
        Decisao.Permitir -> Unit
        is Decisao.Avisar -> {
          AlertaNotificacao.mostrar(this, decisao.numero, decisao.tipo)
          if (AppVisivel.visivel) abrirAlertaDireto(decisao.numero, decisao.tipo)
          resposta = CallResponse.Builder().setSilenceCall(true).build()
        }
        is Decisao.Bloquear -> {
          resposta = CallResponse.Builder()
            .setDisallowCall(true)
            .setRejectCall(true)
            .setSkipNotification(true)
            .build()
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "Falha na triagem; a ligação vai passar normalmente", e)
      resposta = permitir()
    } finally {
      respondToCall(details, resposta)
    }
  }

  private fun permitir() = CallResponse.Builder().build()

  // Com o app na frente, o Android pode mostrar a notificação só no topo; abre o alerta direto.
  private fun abrirAlertaDireto(numero: String, tipo: String) {
    try {
      startActivity(AlertaNotificacao.intentAlerta(this, numero, tipo))
    } catch (e: Exception) {
      Log.w(TAG, "Não foi possível abrir o alerta direto; fica a notificação", e)
    }
  }

  companion object {
    private const val TAG = "TriagemService"
    private const val ARQUIVO_EMBUTIDA = "base-embutida.json"

    @Volatile private var embutida: Map<String, String>? = null

    /** Base local com a lista embutida no app (lida do asset uma única vez). */
    fun base(context: Context): BaseLocal = BaseLocal.abrir(context, embutida(context))

    private fun embutida(context: Context): Map<String, String> =
      embutida ?: synchronized(this) {
        embutida ?: lerEmbutida(context).also { embutida = it }
      }

    private fun lerEmbutida(context: Context): Map<String, String> = try {
      val texto = context.assets.open(ARQUIVO_EMBUTIDA).bufferedReader().use { it.readText() }
      val json = JSONObject(texto)
      json.keys().asSequence().associateWith { json.getString(it) }
    } catch (e: Exception) {
      Log.e(TAG, "Não foi possível ler $ARQUIVO_EMBUTIDA", e)
      emptyMap()
    }
  }
}
