(function (global) { //private scope

  // work in the global YB namespace.
  var YB = global.YB || {};

  function StepperChannel() {
    YB.BaseChannel.call(this, "stepper", "Stepper");

    this.setTarget = this.setTarget.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.setSpeed = this.setSpeed.bind(this);
    this.home = this.home.bind(this);
  }

  StepperChannel.prototype = Object.create(YB.BaseChannel.prototype);
  StepperChannel.prototype.constructor = StepperChannel;

  StepperChannel.currentSliderID = -1;

  StepperChannel.prototype.getConfigSchema = function () {
    // copy base schema to avoid mutating the base literal
    var base = YB.BaseChannel.prototype.getConfigSchema.call(this);

    var schema = Object.assign({}, base);
    return schema;
  };

  StepperChannel.prototype.generateControlUI = function () {
    return `
      <div id="stepperControlCard${this.id}" class="col-12">
        <div class="p-3 bg-secondary border border-secondary rounded text-white">
          <!-- Header row -->
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 id="stepperName${this.id}" class="mb-0 stepperName">${this.name}</h6>
            <div class="input-group input-group-sm" style="width: 150px;">
              <span class="input-group-text">Speed</span>
              <input class="form-control text-end" id="stepperSpeed${this.id}">
              <span class="input-group-text">RPM</span>
            </div>
          </div>

          <div class="row mb-2">
            <div class="input-group">
              <button id="stepperMinus30-${this.id}" class="btn btn-outline-light flex-fill" type="button" title="Move Motor -30°">-30°</button>
              <button id="stepperMinus5-${this.id}" class="btn btn-outline-light flex-fill" type="button" title="Move Motor -5°">-5°</button>
              <button id="stepperMinus1-${this.id}" class="btn btn-outline-light flex-fill" type="button" title="Move Motor -1°">-1°</button>
              <button id="stepperHome${this.id}" type="button" class="btn btn-outline-light flex-fill" title="Start Homing Process">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-house-fill" viewBox="0 0 16 16">
                  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z"/>
                  <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z"/>
                </svg>
              </button>
              <button id="stepperPlus1-${this.id}" class="btn btn-outline-light flex-fill" type="button" title="Move Motor +1°">+1°</button>
              <button id="stepperPlus5-${this.id}" class="btn btn-outline-light flex-fill" type="button" title="Move Motor +5°">+5°</button>
              <button id="stepperPlus30-${this.id}" class="btn btn-outline-light flex-fill" type="button" title="Move Motor +30°">+30°</button>
            </div>
          </div>

          <div class="row mb-2">

            <div class="col-12 col-md-6 mt-1">
              <div class="input-group">
                <span class="input-group-text">Current Angle</span>
                <input id="stepperAngle${this.id}" type="text" class="form-control text-end">
                <span class="input-group-text"><span>°</span></span>
              </div>
            </div>

            <div class="col-12 col-md-6 mt-1">
              <div class="input-group">
                <span class="input-group-text">Target Angle</span>
                <input id="stepperAngleTarget${this.id}" type="text" class="form-control text-end">
                <span class="input-group-text"><span>°</span></span>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  };

  StepperChannel.prototype.setupControlUI = function () {
    YB.BaseChannel.prototype.setupControlUI.call(this);

    const $speed = $('#stepperSpeed' + this.id);
    const $angle = $('#stepperAngle' + this.id);
    const $target = $('#stepperAngleTarget' + this.id);

    $speed.on('change', this.setSpeed);
    $angle.on('change', this.setPosition);
    $target.on('change', this.setTarget);

    $(`#stepperMinus30-${this.id}`).on("click", (e) => {
      $target.val(parseInt($target.val()) - 30);
      this.setTarget(e);
    });

    $(`#stepperMinus5-${this.id}`).on("click", (e) => {
      $target.val(parseInt($target.val()) - 5);
      this.setTarget(e);
    });

    $(`#stepperMinus1-${this.id}`).on("click", (e) => {
      $target.val(parseInt($target.val()) - 1);
      this.setTarget(e);
    });

    $(`#stepperPlus1-${this.id}`).on("click", (e) => {
      $target.val(parseInt($target.val()) + 1);
      this.setTarget(e);
    });

    $(`#stepperPlus5-${this.id}`).on("click", (e) => {
      $target.val(parseInt($target.val()) + 5);
      this.setTarget(e);
    });

    $(`#stepperPlus30-${this.id}`).on("click", (e) => {
      $target.val(parseInt($target.val()) + 30);
      this.setTarget(e);
    });

    $(`#stepperHome${this.id}`).on("click", this.home);

    // mark active while interacting
    $speed.on('focus', () => { StepperChannel.currentSliderID = this.id; });
    $angle.on('focus', () => { StepperChannel.currentSliderID = this.id; });
    $target.on('focus', () => { StepperChannel.currentSliderID = this.id; });

    // clear on stop
    const clearActive = () => { StepperChannel.currentSliderID = -1; };
    $speed.on('blur', clearActive);
    $angle.on('blur', clearActive);
    $target.on('blur', clearActive);
  };

  StepperChannel.prototype.setTarget = function (e) {
    let angle = parseInt($(`#stepperAngleTarget${this.id}`).val());
    if (isNaN(angle))
      angle = 0;

    $(`#stepperAngleTarget${this.id}`).val(angle);

    YB.client.send({
      "cmd": "set_stepper_channel",
      "id": this.id,
      "target_angle": angle
    });
  }

  StepperChannel.prototype.setPosition = function (e) {
    let angle = parseInt($(`#stepperAngle${this.id}`).val());
    if (isNaN(angle))
      angle = 0;

    $(`#stepperAngleTarget${this.id}`).val(angle);

    YB.client.send({
      "cmd": "set_stepper_channel",
      "id": this.id,
      "current_angle": angle
    });
  }

  StepperChannel.prototype.setSpeed = function (e) {
    let speed = parseFloat(e.target.value);
    if (isNaN(speed))
      speed = 0;
    if (speed < 0)
      speed = 0;

    YB.client.send({
      "cmd": "set_stepper_channel",
      "id": this.id,
      "rpm": speed
    });
  }

  StepperChannel.prototype.home = function (e) {
    YB.client.send({
      "cmd": "set_stepper_channel",
      "id": this.id,
      "home": true
    }, false);
  }

  StepperChannel.prototype.generateEditUI = function () {

    let standardFields = this.generateStandardEditFields();

    return `
      <div id="stepperEditCard${this.id}" class="col-xs-12 col-sm-6">
        <div class="p-3 border border-secondary rounded">
          <h5>Stepper Channel #${this.id}</h5>
          ${standardFields}
        </div>
      </div>
    `;
  };

  StepperChannel.prototype.setupEditUI = function () {
    47
    YB.BaseChannel.prototype.setupEditUI.call(this);
  };

  StepperChannel.prototype.updateControlUI = function () {
    if (StepperChannel.currentSliderID != this.id) {
      $('#stepperSpeed' + this.id).val(this.data.speed);
      $('#stepperAngleTarget' + this.id).val(Math.round(parseFloat(this.data.target_angle)));
      $('#stepperAngle' + this.id).val(Math.round(parseFloat(this.data.angle)));
    }

    $(`#stepperControlCard${this.id}`).toggle(this.enabled);
  };

  StepperChannel.prototype.parseConfig = function (cfg) {
    YB.BaseChannel.prototype.parseConfig.call(this, cfg);
  };

  YB.StepperChannel = StepperChannel;
  YB.ChannelRegistry.registerChannelType("stepper", YB.StepperChannel)

  global.YB = YB; // <-- this line makes it global

})(this); //private scope