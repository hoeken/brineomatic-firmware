(function (global) { //private scope

  // work in the global YB namespace.
  var YB = global.YB || {};

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function formatDate(unixSeconds) {
    var d = new Date(unixSeconds * 1000);
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function MaintenanceItem() {
    YB.BaseChannel.call(this, "maintenance", "Maintenance Item");
  }

  MaintenanceItem.prototype = Object.create(YB.BaseChannel.prototype);
  MaintenanceItem.prototype.constructor = MaintenanceItem;

  MaintenanceItem.prototype.generateControlUI = function () {
    return `
      <div id="maintenanceControlCard${this.id}" class="col-12">
        <div class="p-3 border border-secondary rounded text-white">
          <h4 id="maintenanceName${this.id}" class="mb-3 maintenanceName">${this.name}</h4>
          <div class="row">
            <div id="maintenance-runtimeCol${this.id}" class="col-6 col-md-4">
              <h6 class="text-muted small">Runtime (hours)</h6>
              <table class="table table-sm table-dark mb-0">
                <tr>
                  <td>Last Service</td>
                  <td><span id="maintenance-lastRuntime${this.id}">—</span></td>
                </tr>
                <tr>
                  <td>Current</td>
                  <td><span id="maintenance-currentRuntime${this.id}">—</span></td>
                </tr>
                <tr id="maintenance-nextRuntimeRow${this.id}">
                  <td>Next Due</td>
                  <td><span id="maintenance-nextRuntime${this.id}">—</span>
                </td></tr>
              </table>
            </div>
            <div id="maintenance-timestampCol${this.id}" class="col-6 col-md-4">
              <h6 class="text-muted small">Date</h6>
              <table class="table table-sm table-dark mb-0">
                <tr>
                  <td>Last Service</td>
                  <td><span id="maintenance-lastTimestamp${this.id}">—</span></td>
                </tr>
                <tr>
                  <td>Today</td>
                  <td><span id="maintenance-currentTimestamp${this.id}">—</span></td>
                </tr>
                <tr id="maintenance-nextTimestampRow${this.id}">
                  <td>Next Due</td>
                  <td><span id="maintenance-nextTimestamp${this.id}">—</span></td>
                </tr>
              </table>
            </div>
            <div id="maintenance-btnCol${this.id}" class="col-12 col-md-4 text-center align-self-center mt-3 mt-md-0" style="display:none;">
              <button class="btn btn-primary" type="button" id="maintenance-markComplete${this.id}">Mark Service Complete</button>
            </div>
            <div id="maintenance-noInterval${this.id}" class="col-12 text-danger text-center" style="display:none;">Error: no maintenance interval set.</div>
          </div>
        </div>
      </div>
    `;
  };

  MaintenanceItem.prototype.setupControlUI = function () {
    YB.BaseChannel.prototype.setupControlUI.call(this);
  };

  MaintenanceItem.prototype.updateControlUI = function () {
    $(`#maintenanceControlCard${this.id}`).toggle(this.enabled);

    var showRuntime = this.cfg.runtimeInterval > 0;
    var showTimestamp = this.cfg.timestampInterval > 0;
    var hasInterval = showRuntime || showTimestamp;

    var $runtimeCol = $(`#maintenance-runtimeCol${this.id}`);
    var $timestampCol = $(`#maintenance-timestampCol${this.id}`);
    var $btnCol = $(`#maintenance-btnCol${this.id}`);

    $runtimeCol.toggle(showRuntime);
    $timestampCol.toggle(showTimestamp);
    $btnCol.toggle(hasInterval && YB.App.role == 'admin');
    $(`#maintenance-noInterval${this.id}`).toggle(!hasInterval);

    $runtimeCol.removeClass('col-6 col col-md-4 col-md-8');
    $timestampCol.removeClass('col-6 col col-md-4 col-md-8');
    $btnCol.removeClass('col-12 col col-md-4');

    if (YB.App.role == 'admin') {
      if (showRuntime && showTimestamp) {
        $runtimeCol.addClass('col-6 col-md-4');
        $timestampCol.addClass('col-6 col-md-4');
        $btnCol.addClass('col-12 col-md-4');
      } else {
        if (showRuntime) $runtimeCol.addClass('col col-md-8');
        if (showTimestamp) $timestampCol.addClass('col col-md-8');
        $btnCol.addClass('col col-md-4');
      }
    } else {
      $runtimeCol.addClass('col-6');
      $timestampCol.addClass('col-6');
    }

    if (YB.Brineomatic.totalRuntime) {
      if (showRuntime) {
        var totalRuntime = YB.Brineomatic.totalRuntime;
        var lastRuntime = this.data.lastRuntime;
        var currentRuntime = totalRuntime - lastRuntime;
        var nextRuntime = lastRuntime + this.cfg.runtimeInterval;
        var runtimeOverdue = currentRuntime >= this.cfg.runtimeInterval;

        $(`#maintenance-lastRuntime${this.id}`).text(lastRuntime.toFixed(1));
        $(`#maintenance-currentRuntime${this.id}`).text(currentRuntime.toFixed(1));
        $(`#maintenance-nextRuntime${this.id}`).text(nextRuntime.toFixed(1));
        $(`#maintenance-nextRuntimeRow${this.id} td`).removeClass('text-success text-danger').addClass(runtimeOverdue ? 'text-danger' : 'text-success');
      }

      if (showTimestamp) {
        var lastTimestamp = this.data.lastTimestamp;
        var nextTimestamp = lastTimestamp + this.cfg.timestampInterval;
        var nowSeconds = Math.round(Date.now() / 1000);
        var timestampOverdue = nowSeconds >= nextTimestamp;

        $(`#maintenance-lastTimestamp${this.id}`).text(formatDate(lastTimestamp));
        $(`#maintenance-currentTimestamp${this.id}`).text(formatDate(nowSeconds));
        $(`#maintenance-nextTimestamp${this.id}`).text(formatDate(nextTimestamp));
        $(`#maintenance-nextTimestampRow${this.id} td`).removeClass('text-success text-danger').addClass(timestampOverdue ? 'text-danger' : 'text-success');
      }
    }
  };

  validate.validators.maintenanceIntervalRequired = function (value, options, key, attributes) {
    if ((attributes.runtimeInterval > 0) || (attributes.timestampInterval > 0)) {
      return;
    }
    return "at least one interval (runtime or time) must be greater than 0";
  };

  MaintenanceItem.prototype.getConfigSchema = function () {
    // copy base schema to avoid mutating the base literal
    var base = YB.BaseChannel.prototype.getConfigSchema.call(this);

    var schema = Object.assign({}, base);

    schema.runtimeInterval = {
      presence: true,
      numericality: {
        greaterThanOrEqualTo: 0.0,
        lessThanOrEqualTo: 1000.0
      }
    };

    schema.lastRuntime = {
      presence: true,
      numericality: {
        greaterThanOrEqualTo: 0.0,
        lessThanOrEqualTo: 100000.0
      }
    };

    schema.timestampInterval = {
      presence: true,
      numericality: {
        greaterThanOrEqualTo: 0,
        lessThanOrEqualTo: (60 * 60 * 24 * 1000)
      }
    };

    schema.lastTimestamp = {
      presence: true,
      numericality: {
        greaterThanOrEqualTo: 0,
        lessThanOrEqualTo: 4294967295
      }
    };

    return schema;
  };

  MaintenanceItem.prototype.getConfigFormData = function () {
    let newcfg = YB.BaseChannel.prototype.getConfigFormData.call(this);

    newcfg.runtimeInterval = parseFloat($(`#f-maintenance-runtimeInterval-${this.id}`).val());
    newcfg.lastRuntime = parseFloat($(`#f-maintenance-lastRuntime-${this.id}`).val());
    newcfg.timestampInterval = Math.round(parseFloat($(`#f-maintenance-timestampInterval-${this.id}`).val()) * (24 * 60 * 60));
    newcfg.lastTimestamp = parseInt($(`#f-maintenance-lastTimestamp-${this.id}`).val());

    return newcfg;
  }

  MaintenanceItem.prototype.onEditForm = function (e) {
    YB.BaseChannel.prototype.onEditForm.call(this, e);

    //ui updates
    $(`#f-maintenance-runtimeInterval-${this.id}`).prop('disabled', !this.enabled);
    $(`#f-maintenance-lastRuntime-${this.id}`).prop('disabled', !this.enabled);
    $(`#f-maintenance-timestampInterval-${this.id}`).prop('disabled', !this.enabled);
    $(`#f-maintenance-lastTimestamp-${this.id}`).prop('disabled', !this.enabled);
  };

  MaintenanceItem.prototype.generateEditUI = function () {

    let standardFields = this.generateStandardEditFields();

    return `
      <div id="maintenanceEditCard${this.id}" class="col-12 mb-3">
        <div class="p-3 border border-secondary rounded">
          <h5>Maintenance Item #${this.id}</h5>
          ${standardFields}

          <div class="form-floating mb-3">
            <input type="text" class="form-control" id="f-maintenance-runtimeInterval-${this.id}" value="${this.cfg.runtimeInterval}">
            <label for="f-maintenance-runtimeInterval-${this.id}">Runtime Interval (hours)</label>
            <div class="invalid-feedback"></div>
          </div>

          <div class="form-floating mb-3">
            <input type="text" class="form-control" id="f-maintenance-timestampInterval-${this.id}" value="${this.cfg.timestampInterval}">
            <label for="f-maintenance-timestampInterval-${this.id}">Time Interval (days)</label>
            <div class="invalid-feedback"></div>
          </div>

          <div class="form-floating mb-3">
            <input type="text" class="form-control" id="f-maintenance-lastRuntime-${this.id}" value="${this.cfg.lastRuntime}">
            <label for="f-maintenance-lastRuntime-${this.id}">Last Runtime (hours)</label>
            <div class="invalid-feedback"></div>
          </div> 

          <div class="form-floating mb-3">
            <input type="text" class="form-control" id="f-maintenance-lastTimestamp-${this.id}" value="${this.cfg.lastTimestamp}">
            <label for="f-maintenance-lastTimestamp-${this.id}">Last Maintenance (timestamp)</label>
            <div class="invalid-feedback"></div>
          </div>
        </div>
      </div>
    `;
  };

  MaintenanceItem.prototype.generateEditContainer = function () {
    let panel = YB.BaseChannel.prototype.generateEditContainer.call(this);
    panel.displayName = "Maintenance";
    return panel;
  };

  MaintenanceItem.prototype.setupEditUI = function () {
    YB.BaseChannel.prototype.setupEditUI.call(this);

    $(`#f-maintenance-runtimeInterval-${this.id}`).val(this.cfg.runtimeInterval);
    $(`#f-maintenance-timestampInterval-${this.id}`).val(Math.round(this.cfg.timestampInterval / (24 * 60 * 60)));
    $(`#f-maintenance-lastRuntime-${this.id}`).val(this.cfg.lastRuntime);
    $(`#f-maintenance-lastTimestamp-${this.id}`).val(this.cfg.lastTimestamp);

    $(`#f-maintenance-runtimeInterval-${this.id}`).prop('disabled', !this.enabled);
    $(`#f-maintenance-timestampInterval-${this.id}`).prop('disabled', !this.enabled);
    $(`#f-maintenance-lastRuntime-${this.id}`).prop('disabled', !this.enabled);
    $(`#f-maintenance-lastTimestamp-${this.id}`).prop('disabled', !this.enabled);

    $(`#f-maintenance-runtimeInterval-${this.id}`).change(this.onEditForm);
    $(`#f-maintenance-timestampInterval-${this.id}`).change(this.onEditForm);
    $(`#f-maintenance-lastRuntime-${this.id}`).change(this.onEditForm);
    $(`#f-maintenance-lastTimestamp-${this.id}`).change(this.onEditForm);
  };

  YB.MaintenanceItem = MaintenanceItem;
  YB.ChannelRegistry.registerChannelType("maintenance", YB.MaintenanceItem)

  // Create a custom page
  let maintenancePage = new YB.Page({
    name: 'maintenance',
    displayName: 'Maintenance',
    permissionLevel: 'guest',
    showInNavbar: true,
    position: "stats",
    ready: true,
    content: ""
  });

  // Add our open / close handlers and the page itself
  maintenancePage.onOpen(function () {
    YB.App.startUpdatePoller();
    YB.App.getStatsData();
  });
  maintenancePage.onClose(YB.App.stopUpdatePoller);

  YB.App.addPage(maintenancePage);

  global.YB = YB; // <-- this line makes it global

})(this); //private scope