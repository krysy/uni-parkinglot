#include <Arduino.h>
#include <NewPing.h>
#include "sonar.h"



#define GET 'G'
#define LOT 'L'
#define EVERY_LOT 'E'
#define COMMAND_BUFFER_SIZE 4

byte commandBuffer[COMMAND_BUFFER_SIZE];


void processCommands() {
    switch (commandBuffer[0]) {
        case GET:
            switch (commandBuffer[1]) {
            case LOT:
                if (commandBuffer[2]-'0' >= 0 && commandBuffer[2]-'0' <= 2) {
                    Serial.println(distances_cm[commandBuffer[2]-'0']);
                    break;
                } else {
                    Serial.println("INVALID_COMMAND");
                    break; 
                }
                
                break;
            
            default:
                Serial.println("INVALID_COMMAND");
                break;
            }
            break;
        
        default:
            Serial.println("INVALID_COMMAND");
            break;
        }
}

void setup() {
    Serial.begin(115200);
    sonarSetup();
}

void loop() {
    sonarLoop();
    if (Serial.available() > 0) {
        Serial.readBytesUntil('D', commandBuffer, COMMAND_BUFFER_SIZE);
        processCommands();
    }
}