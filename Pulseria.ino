#include <Wire.h>
#include "MAX30100_PulseOximeter.h"

#define REPORTING_PERIOD_MS     1000

PulseOximeter pox;

uint32_t tsLastReport = 0;

int ledState = LOW;
bool hasBeat = false;


void onBeatDetected()
{
//    Serial.println("Finger detected!");
    hasBeat = true;
}

void setup()
{
    Serial.begin(9600);
    Serial.print("q");
    Serial.println("");

//    Serial.print("Initializing pulse oximeter..");

    if (!pox.begin()) {
//        Serial.println("FAILED");
        for(;;);
    } else {
//        Serial.println("SUCCESS");
    }

    

    //Beat detection method
    pox.setOnBeatDetectedCallback(onBeatDetected);
    pinMode(13,OUTPUT);
    pinMode(9,OUTPUT);
}

void loop()
{
    //update
    pox.update();

    
    // 0 means nothing to detect
    if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
//        Serial.print("Heart rate:");
        Serial.print(pox.getHeartRate()); // get heart rate
        Serial.print(" ");
//        Serial.print("bpm / SpO2:");
        Serial.println(pox.getSpO2()); // get oxygen rate
//        Serial.println("%");

        if(hasBeat){
          if(ledState == LOW){
            ledState = HIGH;
            digitalWrite(13,ledState);
            tone(9, 5000);
          }else{
            ledState = LOW;
            digitalWrite(13,ledState);
            noTone(9);
            hasBeat = false;
          }
        }

        tsLastReport = millis();
    }
}
