#include <Arduino.h>
#include <NewPing.h>

#define SONAR_NUM 2
#define MAX_DISTANCE 8// max distance to ping in cm
#define PING_INTERVAL 33

unsigned long pingTimer[SONAR_NUM];
unsigned int distances_cm[SONAR_NUM];
uint8_t currentSensor = 0;
NewPing sonar[SONAR_NUM] = {
  NewPing(53, 52, MAX_DISTANCE),
  NewPing(51, 50, MAX_DISTANCE)
};

// if ping received, set sensor distance in array
void echoCheck(){ 
  if (sonar[currentSensor].check_timer()) {
    distances_cm[currentSensor] = sonar[currentSensor].ping_result / US_ROUNDTRIP_CM;
  }
}

void oneSensorCycle() {
  for (uint8_t i = 0; i < SONAR_NUM; i++){
    Serial.print(i);
    Serial.print("=");
    Serial.print(distances_cm[i]);
    Serial.println("cm");
  }
Serial.println();
} 

void sonarSetup() {
  pingTimer[0] = millis() + 75;
  for (uint8_t i = 1; i < SONAR_NUM; i++) {
    pingTimer[i] = pingTimer[i-1] + PING_INTERVAL;
    sonar[currentSensor].timer_stop();
    currentSensor = i;
    distances_cm[currentSensor] = 0;
    sonar[currentSensor].ping_timer(echoCheck);
  };
}

void sonarLoop() {
  for (uint8_t i = 0; i < SONAR_NUM; i++){
    if (millis() >= pingTimer[i]) {
      pingTimer[i] += PING_INTERVAL * SONAR_NUM;
      if (i==0 && currentSensor == SONAR_NUM -1) {
        //oneSensorCycle();
      }
      sonar[currentSensor].timer_stop();
      currentSensor = i;
      distances_cm[currentSensor] = 255;
      sonar[currentSensor].ping_timer(echoCheck);
    }
  }
}







