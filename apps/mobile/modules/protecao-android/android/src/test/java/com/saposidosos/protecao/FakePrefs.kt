package com.saposidosos.protecao

import android.content.SharedPreferences

/** SharedPreferences em memória, só para testes na JVM. */
class FakePrefs : SharedPreferences {
  val dados = mutableMapOf<String, Any?>()

  override fun getAll(): MutableMap<String, *> = dados.toMutableMap()
  override fun getString(key: String?, defValue: String?) = dados[key] as? String ?: defValue
  override fun getStringSet(key: String?, defValues: MutableSet<String>?): MutableSet<String>? {
    @Suppress("UNCHECKED_CAST")
    return dados[key] as? MutableSet<String> ?: defValues
  }
  override fun getInt(key: String?, defValue: Int) = dados[key] as? Int ?: defValue
  override fun getLong(key: String?, defValue: Long) = dados[key] as? Long ?: defValue
  override fun getFloat(key: String?, defValue: Float) = dados[key] as? Float ?: defValue
  override fun getBoolean(key: String?, defValue: Boolean) = dados[key] as? Boolean ?: defValue
  override fun contains(key: String?) = dados.containsKey(key)
  override fun registerOnSharedPreferenceChangeListener(l: SharedPreferences.OnSharedPreferenceChangeListener?) {}
  override fun unregisterOnSharedPreferenceChangeListener(l: SharedPreferences.OnSharedPreferenceChangeListener?) {}

  override fun edit(): SharedPreferences.Editor = object : SharedPreferences.Editor {
    private val pendentes = mutableMapOf<String, Any?>()
    private var limpar = false

    override fun putString(key: String, value: String?) = apply { pendentes[key] = value }
    override fun putStringSet(key: String, values: MutableSet<String>?) = apply { pendentes[key] = values }
    override fun putInt(key: String, value: Int) = apply { pendentes[key] = value }
    override fun putLong(key: String, value: Long) = apply { pendentes[key] = value }
    override fun putFloat(key: String, value: Float) = apply { pendentes[key] = value }
    override fun putBoolean(key: String, value: Boolean) = apply { pendentes[key] = value }
    override fun remove(key: String) = apply { pendentes[key] = null }
    override fun clear() = apply { limpar = true }
    override fun commit(): Boolean {
      if (limpar) dados.clear()
      pendentes.forEach { (k, v) -> if (v == null) dados.remove(k) else dados[k] = v }
      return true
    }
    override fun apply() { commit() }
  }
}
