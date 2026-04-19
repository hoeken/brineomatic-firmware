/*
  Yarrboard

  Author: Zach Hoeken <hoeken@gmail.com>
  Website: https://github.com/hoeken/yarrboard
  License: GPLv3
*/

#ifndef YARR_MAINTENANCE_CONTROLLER_H
#define YARR_MAINTENANCE_CONTROLLER_H

#include "channels/MaintenanceItem.h"
#include "config.h"
#include <controllers/ChannelController.h>
#include <controllers/ProtocolController.h>

class YarrboardApp;
class MaintenanceController : public ChannelController<MaintenanceItem, YB_MAINTENANCE_ITEMS_COUNT>
{
  public:
    MaintenanceController(YarrboardApp& app);

    bool setup() override;

    void handleConfigCommand(JsonVariantConst input, JsonVariant output, ProtocolContext context);
    void handleSetCommand(JsonVariantConst input, JsonVariant output, ProtocolContext context);

  private:
};

#endif /* !YARR_MAINTENANCE_CONTROLLER_H */