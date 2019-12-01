package net.lhotan.iotlabproject;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.Image;
import android.media.ImageReader;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.provider.Settings;
import android.text.format.Formatter;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;

import com.google.android.things.pio.PeripheralManager;
import com.google.android.things.pio.UartDevice;
import com.google.android.things.pio.UartDeviceCallback;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;


import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;


public class MainActivity extends AppCompatActivity {
    UartDevice mDevice;
    OkHttpClient client = new OkHttpClient();
    String currentCommand;
    volatile String value0;
    volatile String value1;

    String serverUrl = "http://lhotan.net:8080/lots/35801a20-1113-11ea-ac4c-a5718f95e0de";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);


        PeripheralManager manager = PeripheralManager.getInstance();
        List<String> deviceList = manager.getUartDeviceList();
        if (deviceList.isEmpty()) {
            Log.i("UART", "No UART port available on this device.");
        } else {
            Log.i("UART", "List of available devices: " + deviceList);
        }


        // setup UART
        try {
            mDevice = manager.openUartDevice("USB1-1:1.0");
            mDevice.setBaudrate(115200);
            mDevice.setDataSize(8);
            mDevice.setStopBits(1);
            mDevice.setParity(UartDevice.PARITY_NONE);
            mDevice.registerUartDeviceCallback(uartDeviceCallback);

        } catch (IOException e) {
            e.printStackTrace();
        }

        try {
            Thread.sleep(1000);
        } catch (Exception ignore){}

        // Create a new thread to evaluate the data read from the serial connection and post it if it changed
        Runnable runnable = new Runnable() {
            String previousValue;
            String newValue;

            private int isOccupied(Integer lotDistance) {
                if (lotDistance >= 8) {
                    return 0;
                }
                return 1;
            }

            @Override
            public void run() {
                while(true) {
                    try {
                        newValue = "["+isOccupied(Integer.valueOf(value0))+","+isOccupied(Integer.valueOf(value1))+"]";
                        if (!newValue.equals(previousValue)) {
                            Log.i("UART", newValue);
                            previousValue = newValue;
                            Log.i("URL", post(serverUrl, newValue));
                        }
                        Thread.sleep(250);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        };

        Thread thread = new Thread(runnable);
        thread.start();

        byte[] commandBuffer = new byte[]{'G', 'L', '0', 'D'};
        try {
            mDevice.write(commandBuffer, commandBuffer.length);
        } catch (Exception ignore){};
        currentCommand = "GL0D";
    }

    public static final MediaType JSON = MediaType.get("application/json; charset=utf-8");


    String post(String url, String json) throws IOException {
        RequestBody body = RequestBody.create(JSON, json);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();
        try (Response response = client.newCall(request).execute()) {
            return response.body().string();
        }
    }


    public void readUartBuffer(UartDevice uart) throws IOException {
        // Maximum amount of data to read at one time
        final int maxCount = 32;
        byte[] buffer = new byte[maxCount];

        while ((uart.read(buffer, buffer.length)) > 0) {
            String result = new String(buffer, StandardCharsets.UTF_8).replaceAll("[^a-zA-Z0-9]","");
            if (!result.equals("INVALID_COMMAND")) {
                try {
                    if (currentCommand.equals("GL0D")) {
                        byte[] commandBuffer = new byte[]{'G', 'L', '1', 'D'};
                        Thread.sleep(100);
                        mDevice.write(commandBuffer, commandBuffer.length);
                        value0 = result;
                        currentCommand = "GL1D";
                    } else {
                        byte[] commandBuffer = new byte[]{'G', 'L', '0', 'D'};
                        Thread.sleep(100);
                        mDevice.write(commandBuffer, commandBuffer.length);
                        value1 = result;
                        currentCommand = "GL0D";
                    }
                } catch (Exception ignore){}
            }
        }
    }


    private UartDeviceCallback uartDeviceCallback = new UartDeviceCallback() {
        @Override
        public boolean onUartDeviceDataAvailable(UartDevice uartDevice) {
            try {
                readUartBuffer(uartDevice);
            } catch (IOException e) {
                e.printStackTrace();
            }
            // listen for more interrupts
            return true;
        }
        @Override
        public void onUartDeviceError(UartDevice uart, int error) {
            Log.w("UART", uart + ": Error event " + error);
        }

    };
}
