/*
  Yarrboard

  Author: Zach Hoeken <hoeken@gmail.com>
  Website: https://github.com/hoeken/yarrboard
  License: GPLv3
*/

#include "channels/MaintenanceItem.h"
#include "config.h"
#include <LittleFS.h>

void MaintenanceItem::init(uint8_t id)
{
  BaseChannel::init(id);
  this->channel_type = "maintenance";

  snprintf(this->name, sizeof(this->name), "Maintenance Item %d", id);
}

bool MaintenanceItem::loadConfig(JsonVariantConst config, char* error, size_t len)
{
  // make our parent do the work.
  if (!BaseChannel::loadConfig(config, error, len))
    return false;

  this->runtimeInterval = config["runtimeInterval"] | 0.0f;
  this->timestampInterval = config["timestampInterval"] | 0;
  this->lastRuntime = config["lastRuntime"] | 0.0f;
  this->lastTimestamp = config["lastTimestamp"] | 0;

  return true;
}

void MaintenanceItem::generateConfig(JsonVariant config)
{
  BaseChannel::generateConfig(config);

  config["runtimeInterval"] = this->runtimeInterval;
  config["timestampInterval"] = this->timestampInterval;
  config["lastRuntime"] = this->lastRuntime;
  config["lastTimestamp"] = this->lastTimestamp;
}

void MaintenanceItem::generateUpdate(JsonVariant config)
{
  BaseChannel::generateUpdate(config);

  config["lastRuntime"] = lastRuntime;
  config["lastTimestamp"] = lastTimestamp;
}

void MaintenanceItem::recordMaintenance(float runtime, uint32_t timestamp, String notes)
{
  TRACE();

  this->lastRuntime = runtime;
  this->lastTimestamp = timestamp;

  DUMP(runtime);
  DUMP(timestamp);

  JsonDocument log;
  log["name"] = name;
  log["runtime"] = runtime;
  log["timestamp"] = timestamp;
  log["notes"] = notes;

  File f = LittleFS.open("/maintenance.json", "a");
  if (f) {
    serializeJson(log, f);
    f.println();
    f.close();
  }
}