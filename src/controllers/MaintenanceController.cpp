/*
  Yarrboard

  Author: Zach Hoeken <hoeken@gmail.com>
  Website: https://github.com/hoeken/yarrboard
  License: GPLv3
*/

#include "config.h"
#ifdef YB_HAS_SERVO_CHANNELS

  #include "controllers/BrineomaticController.h"
  #include "controllers/MaintenanceController.h"
  #include <ConfigManager.h>
  #include <YarrboardApp.h>
  #include <YarrboardDebug.h>
  #include <controllers/ProtocolController.h>

MaintenanceController::MaintenanceController(YarrboardApp& app, BrineomaticController& bom) : ChannelController(app, "maintenance"), _bom(bom)
{
}

bool MaintenanceController::setup()
{
  _app.protocol.registerCommand(ADMIN, "config_maintenance_channel", this, &MaintenanceController::handleConfigCommand);
  _app.protocol.registerCommand(ADMIN, "record_maintenance", this, &MaintenanceController::handleRecordMaintenance);

  return true;
}

void MaintenanceController::handleConfigCommand(JsonVariantConst input, JsonVariant output, ProtocolContext context)
{
  ChannelController::handleConfigCommand(input, output);
}

void MaintenanceController::handleRecordMaintenance(JsonVariantConst input, JsonVariant output, ProtocolContext context)
{
  // load our channel
  auto* ch = lookupChannel(input, output);
  if (!ch)
    return;

  // is it enabled?
  if (!ch->isEnabled)
    return _app.protocol.generateErrorJSON(output, "Channel is not enabled.");

  ch->recordMaintenance(_bom.getTotalRuntime() / 3600.0f, (uint32_t)_app.ntp.getTime());

  // write it to file
  char error[128];
  if (!_app.config.saveConfig(error, sizeof(error)))
    return _app.protocol.generateErrorJSON(output, error);
}

#endif