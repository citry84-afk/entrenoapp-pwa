package com.lipastudios.entrenoapp;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Capacitor SystemBars owns the WebView insets; do not add a second padding layer.
        EdgeToEdge.enable(this);
    }
}
