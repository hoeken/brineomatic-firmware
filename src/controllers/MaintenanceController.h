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
class BrineomaticController;
class MaintenanceController : public ChannelController<MaintenanceItem, YB_MAINTENANCE_ITEMS_COUNT>
{
  public:
    MaintenanceController(YarrboardApp& app, BrineomaticController& bom);

    bool setup() override;

    void handleConfigCommand(JsonVariantConst input, JsonVariant output, ProtocolContext context);
    void handleRecordMaintenance(JsonVariantConst input, JsonVariant output, ProtocolContext context);
    void handleDeleteLogs(JsonVariantConst input, JsonVariant output, ProtocolContext context);

  private:
    BrineomaticController& _bom;
};

#endif /* !YARR_MAINTENANCE_CONTROLLER_H */