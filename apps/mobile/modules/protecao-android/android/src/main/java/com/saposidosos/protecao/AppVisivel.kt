package com.saposidosos.protecao

/** Se a tela do app está visível agora (vale para o processo inteiro, inclusive o serviço de triagem). */
object AppVisivel {
  @Volatile var visivel: Boolean = false
}
