package com.saposidosos.protecao

import android.Manifest
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.Settings
import android.telecom.TelecomManager
import android.util.Log
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class NumeroGolpe : Record {
  @Field val numero: String = ""
  @Field val tipo: String = ""
}

class ProtecaoAndroidModule : Module() {
  private var pedidoPapel: Promise? = null

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val roleManager: RoleManager
    get() = context.getSystemService(RoleManager::class.java)

  private fun base() = TriagemService.base(context)

  private fun temPapel() = roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)

  override fun definition() = ModuleDefinition {
    Name("ProtecaoAndroid")

    Function("temPapelTriagem") { temPapel() }

    AsyncFunction("pedirPapelTriagem") { promise: Promise ->
      if (temPapel()) {
        promise.resolve(true)
        return@AsyncFunction
      }
      val atividade = appContext.currentActivity ?: throw Exceptions.MissingActivity()
      pedidoPapel?.resolve(false)
      pedidoPapel = promise
      atividade.startActivityForResult(
        roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING),
        PEDIDO_PAPEL_TRIAGEM,
      )
    }.runOnQueue(Queues.MAIN) // pedidoPapel só é tocado na main thread (como OnActivityResult)

    OnActivityResult { _, payload ->
      if (payload.requestCode != PEDIDO_PAPEL_TRIAGEM) return@OnActivityResult
      pedidoPapel?.resolve(temPapel())
      pedidoPapel = null
    }

    Function("ehTelaInicialPadrao") {
      val home = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
      val padrao = context.packageManager.resolveActivity(home, PackageManager.MATCH_DEFAULT_ONLY)
      padrao?.activityInfo?.packageName == context.packageName
    }

    Function("abrirEscolhaTelaInicial") {
      val intent = Intent(Settings.ACTION_HOME_SETTINGS)
      val atividade = appContext.currentActivity
      if (atividade != null) {
        atividade.startActivity(intent)
      } else {
        context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
      }
    }

    Function("podeAvisar") { AlertaNotificacao.podeAvisar(context) }

    Function("gravarBase") { numeros: List<NumeroGolpe>, versao: Int ->
      base().gravar(numeros.associate { it.numero to it.tipo }, versao)
    }

    Function("adicionarNumeroTeste") { numero: String, tipo: String ->
      base().adicionarTeste(numero, tipo)
    }

    Function("versaoBase") { base().versao() }

    Function("totalNumeros") { base().numeros().size }

    Function("definirRegra") { regra: String ->
      base().regra = when (regra) {
        "avisar" -> Regra.AVISAR
        "bloquear" -> Regra.BLOQUEAR
        else -> throw IllegalArgumentException("Regra desconhecida: $regra")
      }
    }

    Function("regra") {
      when (base().regra) {
        Regra.AVISAR -> "avisar"
        Regra.BLOQUEAR -> "bloquear"
      }
    }

    Function("encerrarChamada") {
      val permitido = ContextCompat.checkSelfPermission(context, Manifest.permission.ANSWER_PHONE_CALLS) ==
        PackageManager.PERMISSION_GRANTED
      if (!permitido) return@Function false
      try {
        @Suppress("DEPRECATION")
        context.getSystemService(TelecomManager::class.java).endCall()
      } catch (e: Exception) {
        Log.w(TAG, "Não foi possível encerrar a ligação", e)
        false
      }
    }
  }

  companion object {
    private const val TAG = "ProtecaoAndroid"
    private const val PEDIDO_PAPEL_TRIAGEM = 7301
  }
}
