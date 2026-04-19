/*
  Yarrboard

  Author: Zach Hoeken <hoeken@gmail.com>
  Website: https://github.com/hoeken/yarrboard
  License: GPLv3
*/

#include "config.h"
#ifdef YB_HAS_SERVO_CHANNELS

  #include "controllers/MaintenanceController.h"
  #include <ConfigManager.h>
  #include <YarrboardApp.h>
  #include <YarrboardDebug.h>
  #include <controllers/ProtocolController.h>

MaintenanceController::MaintenanceController(YarrboardApp& app) : ChannelController(app, "maintenance")
{
}

bool MaintenanceController::setup()
{
  _app.protocol.registerCommand(ADMIN, "config_maintenance_channel", this, &MaintenanceController::handleConfigCommand);
  _app.protocol.registerCommand(GUEST, "set_maintenance_item", this, &MaintenanceController::handleSetCommand);

  return true;
}

void MaintenanceController::handleConfigCommand(JsonVariantConst input, JsonVariant output, ProtocolContext context)
{
  ChannelController::handleConfigCommand(input, output);
}

void MaintenanceController::handleSetCommand(JsonVariantConst input, JsonVariant output, ProtocolContext context)
{
  // load our channel
  auto* ch = lookupChannel(input, output);
  if (!ch)
    return;

  // is it enabled?
  if (!ch->isEnabled)
    return _app.protocol.generateErrorJSON(output, "Channel is not enabled.");
}

#endif