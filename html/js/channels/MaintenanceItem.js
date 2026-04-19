(function (global) { //private scope

  // work in the global YB namespace.
  var YB = global.YB || {};

  function MaintenanceItem() {
    YB.BaseChannel.call(this, "maintenance", "Maintenance Item");
  }

  MaintenanceItem.prototype = Object.create(YB.BaseChannel.prototype);
  MaintenanceItem.prototype.constructor = MaintenanceItem;

  MaintenanceItem.prototype.generateControlUI = function () {
    return `
      <div id="maintenanceControlCard${this.id}" class="col-12">
        <div class="p-3 border border-secondary rounded text-white">
          <!-- Header row -->
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 id="maintenanceName${this.id}" class="mb-0 maintenanceName">${this.name}</h6>
            <ul>
              <li><b>runtimeInterval</b> - <span id="maintenance-runtimeInterval${this.id}">${this.cfg.runtimeInterval}</span></li>
              <li><b>timestampInterval</b> - <span id="maintenance-timestampInterval${this.id}">${this.cfg.timestampInterval}</span></li>
              <li><b>lastRuntime</b> - <span id="maintenance-lastRuntime${this.id}"></span></li>
              <li><b>lastTimestamp</b> - <span id="maintenance-lastTimestamp${this.id}"></span></li>
            </ul>
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

    console.log(YB.Brineomatic.totalRuntime);

    if (YB.Brineomatic.totalRuntime !== false) {
      $(`#maintenance-lastRuntime${this.id}`).html(this.data.lastRuntime);
      $(`#maintenance-lastTimestamp${this.id}`).html(this.data.lastTimestamp);
    }
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
        lessThanOrEqualTo: 2 ^ 32 - 1
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
    console.log(panel);
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