package com.example.lola

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.AlarmClock
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import java.util.ArrayList

class MainActivity : ComponentActivity() {
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val webView = WebView(this)
        
        // FAKE USER AGENT (Chrome Mobile muito comum) para enganar o Google
        webView.settings.userAgentString = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
        
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.databaseEnabled = true
        
        // Habilitar cookies (crucial para o OAuth não entrar em loop)
        val cookieManager = android.webkit.CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()
        
        // Ponte de comunicação com o Frontend
        webView.addJavascriptInterface(LolaAndroidInterface(this), "LolaAndroid")
        
        webView.loadUrl("https://lola-app.onrender.com")
        
        setContentView(webView)
    }

    override fun onPause() {
        super.onPause()
        // Força o sistema a salvar os cookies (sessão de login) no armazenamento permanente do celular
        android.webkit.CookieManager.getInstance().flush()
    }
}

class LolaAndroidInterface(private val context: Context) {
    @JavascriptInterface
    fun criarAlarme(hora: Int, minuto: Int, rotulo: String, diasCsv: String?) {
        val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
            putExtra(AlarmClock.EXTRA_HOUR, hora)
            putExtra(AlarmClock.EXTRA_MINUTES, minuto)
            putExtra(AlarmClock.EXTRA_MESSAGE, rotulo)
            putExtra(AlarmClock.EXTRA_SKIP_UI, true) // SILENT MODE
            
            // diasCsv expected: "2,3,4,5,6" 
            // 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday
            if (!diasCsv.isNullOrEmpty()) {
                val daysList = ArrayList<Int>()
                diasCsv.split(",").forEach {
                    val day = it.trim().toIntOrNull()
                    if (day != null) daysList.add(day)
                }
                if (daysList.isNotEmpty()) {
                    putExtra(AlarmClock.EXTRA_DAYS, daysList)
                }
            }
        }
        
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        if (intent.resolveActivity(context.packageManager) != null) {
            context.startActivity(intent)
        }
    }
}
