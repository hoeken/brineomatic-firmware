/*
  Yarrboard

  Author: Zach Hoeken <hoeken@gmail.com>
  Website: https://github.com/hoeken/yarrboard
  License: GPLv3
*/

#ifndef YARR_MAINTENANCE_CHANNEL_H
#define YARR_MAINTENANCE_CHANNEL_H

#include "config.h"
#include <Arduino.h>
#include <channels/BaseChannel.h>

class MaintenanceItem : public BaseChannel
{
  public:
    void init(uint8_t id) override;
    bool loadConfig(JsonVariantConst config, char* error, size_t len) override;
    void generateConfig(JsonVariant config) override;
    void generateUpdate(JsonVariant config) override;

  private:
    float runtimeInterval = 0;
    uint32_t timestampInterval = 0;

    float lastRuntime = 0;
    uint32_t lastTimestamp = 0;
};

#endif /* !YARR_MAINTENANCE_CHANNEL_H */