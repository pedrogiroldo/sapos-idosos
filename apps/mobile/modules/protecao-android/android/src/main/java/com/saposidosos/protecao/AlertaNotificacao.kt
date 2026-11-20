package com.saposidosos.protecao

import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

/**
 * O app só avisa com notificações ligadas, tela cheia permitida e o canal do alerta não desligado.
 * `importanciaCanal` é `null` enquanto o canal ainda não foi criado (ele nasce com importância alta).
 */
fun podeAvisarCom(notificacoesAtivas: Boolean, fsiPermitido: Boolean, importanciaCanal: Int?): Boolean =
  notificacoesAtivas && fsiPermitido && importanciaCanal != NotificationManager.IMPORTANCE_NONE

/** Notificação em tela cheia que abre o alerta do app durante uma ligação suspeita. */
object AlertaNotificacao {
  const val CANAL = "alerta_ligacao"
  private const val ID_NOTIFICACAO = 4001

  /** Notificações ligadas, canal do alerta ativo e, no Android 14+, permissão de abrir em tela cheia. */
  fun podeAvisar(context: Context): Boolean {
    val gerenciador = context.getSystemService(NotificationManager::class.java)
    val fsiPermitido = Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE ||
      gerenciador.canUseFullScreenIntent()
    return podeAvisarCom(
      NotificationManagerCompat.from(context).areNotificationsEnabled(),
      fsiPermitido,
      gerenciador.getNotificationChannel(CANAL)?.importance,
    )
  }

  fun cancelar(context: Context) {
    NotificationManagerCompat.from(context).cancel(ID_NOTIFICACAO)
  }

  fun linkAlerta(numero: String, tipo: String): Uri =
    Uri.parse("saposidosos://alerta-ligacao?numero=${Uri.encode(numero)}&tipo=${Uri.encode(tipo)}")

  fun intentAlerta(context: Context, numero: String, tipo: String): Intent =
    Intent(Intent.ACTION_VIEW, linkAlerta(numero, tipo))
      .setPackage(context.packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

  @SuppressLint("MissingPermission") // podeAvisar() confere antes de a triagem chamar mostrar()
  fun mostrar(context: Context, numero: String, tipo: String) {
    criarCanal(context)
    val intent = intentAlerta(context, numero, tipo)
    val abrirAlerta = PendingIntent.getActivity(
      context,
      0,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    val notificacao = NotificationCompat.Builder(context, CANAL)
      .setSmallIcon(android.R.drawable.stat_sys_warning)
      .setContentTitle("Cuidado!")
      .setContentText("Pode ser golpe. Não atenda.")
      .setCategory(NotificationCompat.CATEGORY_CALL)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setContentIntent(abrirAlerta)
      .setFullScreenIntent(abrirAlerta, true)
      .setAutoCancel(true)
      .build()
    NotificationManagerCompat.from(context).notify(ID_NOTIFICACAO, notificacao)
  }

  private fun criarCanal(context: Context) {
    val canal = NotificationChannel(CANAL, "Alerta de ligação", NotificationManager.IMPORTANCE_HIGH)
    canal.description = "Avisa quando uma ligação pode ser golpe."
    context.getSystemService(NotificationManager::class.java).createNotificationChannel(canal)
  }
}
