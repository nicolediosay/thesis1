#include "WiFi.h"
#include "SPIFFS.h"
#include "ESPAsyncWebServer.h"

const char* ssid = "nicoke";
const char* password =  "Makati23";

AsyncWebServer server(80);

int LED = 12;
int Light = 32;

String processor(const String& var){
  Serial.println(var);
  if(var == "STATE"){
    Serial.print("Testing"); // testing state
    return "Returning";
  }

  return String();
}

String processorCoco(const String& var){
  Serial.println(var);
  if(var == "STATE"){
    return "run";
  }

  return String();
}



void setup(){
  Serial.begin(115200);

  pinMode(LED, OUTPUT);

  ledcSetup(3, 8000, 12); // buzzer
  ledcSetup(0, 5000, 8); //led
  ledcAttachPin(LED,3); //buzz
  ledcAttachPin(Light,0); // Light




  Serial.begin(115200);


  if(!SPIFFS.begin()){
     Serial.println("An Error has occurred somewhere on SPIFFS");
     return;
  }

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }

  Serial.println(WiFi.localIP());




  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/index.html", String(), false, processor);
  });

  server.on("/msg", HTTP_GET, [](AsyncWebServerRequest *request){
    buzzMe();
    thereBeLight();
    request->send(200, "text/plain", "transfer okay be!");
  });

  server.on("/img/police_bg.jpg", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/img/police_bg.jpg", "image/jpeg");
  });




  server.on("/css/style.css", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/css/style.css", "text/css", false);
  });



  server.begin();
}

void activateBuzzer(boolean state){
  // If the state is true, activate the buzzer with the given frequency.
  if(state) {
    ledcWriteTone(3, 500);
    delay(1000);
    ledcWriteTone(3, 0);
  };

}

unsigned long previousMillis = 0;
const long interval = 1000;
int ledVal = 0;
int counter = 0;
int buzzCounter = 0;
int buzzFreq = 500;
boolean ledRunning = false;
boolean isBuzzing = false;

// let there be light!

void thereBeLight(){
  ledRunning = true;
}

// buxx the buzzer
void buzzMe(){
  isBuzzing = true;
}

void loop(){
    unsigned long currentMillis = millis();
    if(ledRunning && isBuzzing){
      if (currentMillis - previousMillis >= interval) {
        // save the last time you blinked the LED
        previousMillis = currentMillis;

        // on and off timer
        if (ledVal == 0) {
          ledVal = 255;
          counter++;
          buzzCounter++;
        } else {
          ledVal = 0;
        }
        ledcWrite(0,ledVal);
        ledcWriteTone(3, buzzFreq);
      }

    }

    if(counter == 10){
      ledRunning = false;
      ledVal = 0;
      ledcWrite(0,0);
      counter = 0;
      isBuzzing = false;
      buzzCounter = 0;
      buzzFreq = 500;
    }
    if(buzzCounter == 5){
      ledcWriteTone(3, 0);
      buzzFreq = 0;

    }


}
