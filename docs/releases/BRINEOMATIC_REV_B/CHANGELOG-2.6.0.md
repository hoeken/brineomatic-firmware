# Version 2.6.0

## 🚀 New Features

- **Maintenance Tracker**
  - New maintenance tracking system to log and monitor scheduled maintenance tasks
  - Full UI with log table, sorting, badging for overdue/remaining items
  - Modal editing, red border highlight when maintenance is overdue
  - Delete logs functionality on the System page

- **Run Log**
  - Added Brineomatic run log for recording and reviewing run results

- **Stabilization Times**
  - Configurable stabilization delays for membrane pressure, product flowrate, and product salinity (fixes #4)
  - Timings are enabled/disabled dynamically based on configured sensors
  - Stabilization waits are now enforced in the actual run state machine

- **Tank Full as Configurable Safeguard**
  - Moved tank full check out of hardcoded logic into the configurable safeguard system

- **Dual Relay Support for Diverter Valve**
  - Diverter valve can now be controlled by two relays simultaneously (fixes #11)

- **Invertable Stepper Motor Direction**
  - Added configuration option to invert the stepper motor direction (fixes #6)

- **Gauge Sort Mode Toggle**
  - Added a dedicated button to enter/exit gauge ordering edit mode (separate from IDLE/MANUAL)
  - Overlay now shown in sort mode indicating gauges are draggable and deletable

## 🛠️ Improvements & Enhancements

- Sensor requirements are now dynamically visible and highlighted red when unmet
- Improved stepper motor control UI (fixes #7)
- Updated section titles for better mobile display
- Logs converted to gridjs for improved table rendering and sorting
- Delete warning buttons styled yellow for clearer intent
- Config generation now respects config purpose and user role

## 🐛 Bug Fixes

- Fixed inverted diverter valve glitch on startup (fixes #5)
- Disabled all hardware outputs before waiting for pressure to zero (fixes #10)
- Fixed bug where all mode buttons were visible when the board restarted
- Fixed bug with `lastRuntime` initialization
- Fixed crash errors on server access when WiFi connection failed
- Fixed page loading/ready flag error

## Infrastructure

- Updated to new YarrboardFramework 3.0 API (sanitize/load config, config purpose/role)
- HTTPS support now using PSRAM
- Fixed firmware URL and CI workflow issues

---