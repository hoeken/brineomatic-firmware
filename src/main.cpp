/*
  Yarrboard

  Author: Zach Hoeken <hoeken@gmail.com>
  Website: https://github.com/hoeken/yarrboard
  License: GPLv3
*/

#include "config.h"

#include "brineomatic.h"
#include "controllers/BrineomaticController.h"
#include "controllers/MaintenanceController.h"
#include "controllers/RelayController.h"
#include "controllers/ServoController.h"
#include "controllers/StepperController.h"
#include "gulp/gulped.h"
#include <Arduino.h>
#include <LittleFS.h>
#include <YarrboardFramework.h>
#include <controllers/NavicoController.h>

YarrboardApp yba;
NavicoController navico(yba);
RelayController relays(yba);
ServoController servos(yba);
StepperController steppers(yba);
BrineomaticController bom(yba, relays, servos, steppers);
MaintenanceController maintenance(yba, bom);

#ifdef YB_HAS_PIEZO
  #include "controllers/BuzzerController.h"
BuzzerController buzzer(yba);
#endif

#ifdef YB_HAS_STATUS_RGB
  #include "controllers/RGBController.h"
RGBController<WS2812B, YB_STATUS_RGB_PIN, YB_STATUS_RGB_ORDER> rgb(yba, YB_STATUS_RGB_COUNT);
#endif

#include "gulp/index.html.h"

void setup()
{
  yba.registerController(navico);

#ifdef YB_HAS_PIEZO
  buzzer.setBuzzerPin(YB_PIEZO_PIN);
  #ifdef YB_PIEZO_PASSIVE
  buzzer.setActive(false);
  #else
  buzzer.setActive(true);
  #endif
  yba.registerController(buzzer);
#endif

#ifdef YB_HAS_STATUS_RGB
  yba.registerController(rgb);
#endif

  yba.registerController(relays);
  yba.registerController(servos);
  yba.registerController(steppers);
  yba.registerController(maintenance);
  yba.registerController(bom);

  yba.http.registerGulpedFiles(gulpedFiles, gulpedFilesCount);

  yba.board_name = YB_BOARD_NAME;
  yba.default_hostname = YB_DEFAULT_HOSTNAME;
  yba.firmware_version = YB_FIRMWARE_VERSION;
  yba.hardware_version = YB_HARDWARE_VERSION;
  yba.manufacturer = YB_MANUFACTURER;
  yba.hardware_url = YB_HARDWARE_URL;
  yba.project_name = YB_PROJECT_NAME;
  yba.project_url = YB_PROJECT_URL;
  yba.git_url = YB_GIT_URL;

  yba.ota.firmware_manifest_url = YB_OTA_MANIFEST_URL;
  yba.ota.public_key = R"PUBLIC_KEY(
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAjsPaBVvAoSlNEdxLnKl5
71m+8nEbI6jTenIau884++X+tzjRM/4vctpkfM+b6yPEER6hLKLU5Sr/sVbNAu3s
Ih9UHsgbyzQ4r+NMzM8ohvPov1j5+NgzoIRPn9IQR40p/Mr3T31MXoeSh/WXw7yJ
BjVH2KhTD14e8Yc9CiEUvzYhFVjs8Doy1q2+jffiutcR8z+zGBSGHI3klTK8mNau
r9weglTUCObkUfbgrUWXOkDN50Q97OOv99+p8NPkcThZYbaqjbrOCO9vnMFB9Mxj
5yDruS9QF/qhJ5mC7AuHLhAGdkPu+3OXRDlIJN1j7y8SorvQj9F17B8wnhNBfDPN
QbJc4isLIIBGECfmamCONi5tt6fcZC/xZTxCiEURG+JVgUKjw+mIBrv+iVn9NKYK
UF8shPfl0CGKzOvsXBf91pqF5rHs6TpVw985u1VFbRrUL6nmsCELFxBz/+y83uhj
jsROITwP34vi7qMuHm8UzTnfxH0dSuI6PfWESIM8aq6bidBgUWlnoN/zQ/pwLVsz
0Gh5tAoFCyJ+FZiKS+2spkJ5mJBMY0Ti3dHinp6E2YNxY7IMV/4E9oK+MzvX1m5s
rgu4zp1Wfh2Q5QMX6bTrDCTn52KdyJ6z2WTnafaA08zeKOP+uVAPT0HLShF/ITEX
+Cd7GvvuZMs80QvqoXi+k8UCAwEAAQ==
-----END PUBLIC KEY-----
)PUBLIC_KEY";

  yba.setup();
}

void loop()
{
  yba.loop();
}