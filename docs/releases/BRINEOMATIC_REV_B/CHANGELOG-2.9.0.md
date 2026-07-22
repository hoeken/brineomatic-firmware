# Version 2.9.0

## 🚀 New Features

- **Pre Run Flush**
  - New option to prime the system by opening the flush valve for a configurable duration before the boost / high pressure pump starts, then closing it
  - Useful for watermakers without boost pumps
  - New hardware config (Flush Valve section): `preflushEnabled` (default off) and `preflushDuration` (ms, default 5000, hidden when disabled)
  - Flush valve status is shown during RUNNING mode when pre-run flush is enabled

## 🐛 Bug Fixes

- Use a `double` accumulator for sensor statistics to fix inaccurate averages over long runs
- Plot sensor graph data at full precision, rounding only for label display

---