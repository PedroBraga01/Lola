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
import android.widget.Toast
import androidx.activity.ComponentActivity
import org.json.JSONArray
import java.util.Calendar

class MainActivity : ComponentActivity() {

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webViewClient = WebViewClient()
            webChromeClient = WebChromeClient()
            
            // Injetamos a interface AndroidLolaInterface
            addJavascriptInterface(LolaJavascriptInterface(this@MainActivity), "AndroidLolaInterface")
            
            // URL do frontend deployado no Render
            loadUrl("https://lola-app.onrender.com")
        }

        setContentView(webView)
    }
}

class LolaJavascriptInterface(private val context: Context) {

    @JavascriptInterface
    fun createAlarm(hour: Int, minute: Int, daysJson: String, label: String) {
        val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
            putExtra(AlarmClock.EXTRA_HOUR, hour)
            putExtra(AlarmClock.EXTRA_MINUTES, minute)
            putExtra(AlarmClock.EXTRA_MESSAGE, label)
            putExtra(AlarmClock.EXTRA_SKIP_UI, true) // Cria de forma silenciosa

            try {
                // Parse the daysJson if provided. e.g. [2,3,4,5,6] (Monday to Friday)
                // Calendar.SUNDAY = 1, MONDAY = 2...
                if (daysJson.isNotBlank() && daysJson != "[]") {
                    val daysArray = JSONArray(daysJson)
                    val daysList = ArrayList<Int>()
                    for (i in 0 until daysArray.length()) {
                        daysList.add(daysArray.getInt(i))
                    }
                    putExtra(AlarmClock.EXTRA_DAYS, daysList)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // Tentar iniciar o alarme
        try {
            context.startActivity(intent)
            Toast.makeText(context, "Alarme '$label' criado na Lola!", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(context, "Erro ao criar alarme: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
}
