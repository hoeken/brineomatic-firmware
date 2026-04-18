/*
  Yarrboard

  Author: Zach Hoeken <hoeken@gmail.com>
  Website: https://github.com/hoeken/yarrboard
  License: GPLv3
*/

#ifndef YARR_STEPPER_CHANNEL_H
#define YARR_STEPPER_CHANNEL_H

#include "config.h"

#ifdef YB_HAS_STEPPER_CHANNELS

  #include "FastAccelStepper.h"
  #ifdef YB_STEPPER_DRIVER_TMC2209
    #include "TMC2209.h"
  #endif
  #include <Arduino.h>
  #include <channels/BaseChannel.h>

class StepperChannel : public BaseChannel
{
  protected:
  public:
    const char* lastErrorMessage = nullptr;

    void init(uint8_t id) override;
    bool loadConfig(JsonVariantConst config, char* error, size_t len) override;
    void generateConfig(JsonVariant config) override;
    void generateUpdate(JsonVariant config) override;

    void setup(FastAccelStepperEngine* engine, byte step_pin, byte dir_pin, byte enable_pin, byte diag_pin);
    void setSpeed(float rpm);
    void setAngle(float angle);
    void setStepsPerDegree(float steps);
    void setRunCurrent(uint8_t current);
    void setHomeCurrent(uint8_t current);
    void setHoldCurrent(uint8_t current);
    float getSpeed();
    float getAngle();
    float getTargetAngle();
    int32_t getPosition();
    int32_t getTarget();
    void gotoAngle(float angle, float rpm = -1);
    void gotoPosition(int32_t position, float rpm = -1);
    bool home();
    bool home(float rpm);
    bool homeWithSpeed(float rpm);
    void waitUntilStopped();

    TMC2209::Status getStatus();
    bool isOverheated(TMC2209::Status& status);
    bool isShorted(TMC2209::Status& status);
    bool isOpenCircuit(TMC2209::Status& status);
    bool hasError(TMC2209::Status& status);
    const char* getError(TMC2209::Status& status);

    void setDirectionInverted(bool inverted);
    bool isEndstopHit();
    void disable();

    void printDebug();

  private:
    float targetAngle = 0.0;
    float currentSpeed = 0.0;
    uint32_t autoDisableMillis = 10000;

    unsigned long lastUpdateMillis = 0;

    FastAccelStepperEngine* _engine;
    TMC2209 _tmc2209;
    byte _diag_pin;
    uint8_t _run_current = 50;
    uint8_t _home_current = 30;
    uint8_t _hold_current = 20;
    uint8_t _stall_guard = 90;

    volatile bool _endstopTriggered = false;

    FastAccelStepper* _stepper = NULL;
    byte _step_pin;
    byte _dir_pin;
    byte _enable_pin;
    bool _direction_inverted = false;

    float _steps_per_degree = 200 * YB_STEPPER_MICROSTEPS;
    uint32_t _acceleration = _steps_per_degree * 720; // steps/s^2
    uint32_t _backoff_steps = 15 * _steps_per_degree; // release distance
    float _default_speed_rpm = 10.0;                  // typical homing speed
    float _home_speed_rpm = 35.0;                     // homing speed
    uint32_t _timeout_ms = 15000;                     // homing timeout

    static void ARDUINO_ISR_ATTR stallGuardISR(void* arg)
    {
      auto* self = static_cast<StepperChannel*>(arg);
      self->_endstopTriggered = true;
    }
};

#endif
#endif /* !YARR_STEPPER_CHANNEL_H */