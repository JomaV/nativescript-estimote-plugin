/*
  Estimote Nativescript Plugin
*/

global.ESTIMOTE_PROXIMITY_UUID = NSUUID.alloc().initWithUUIDString("85FC11DD-4CCA-4B27-AFB3-876854BB5C3B");
global.ESTIMOTE_REGION_NAME = "estimote";

var BeaconManagerDelegateImpl = (function (_super) {
    __extends(BeaconManagerDelegateImpl, _super);
    function BeaconManagerDelegateImpl() {
        _super.apply(this, arguments);
    }
    BeaconManagerDelegateImpl.new = function () {
        return _super.new.call(this);
    };

    BeaconManagerDelegateImpl.prototype.initWithRegion = function (region, callback) {
        this._region = region;
        this._callback = callback;
        return this;
    };

    BeaconManagerDelegateImpl.prototype.beaconManagerDidChangeAuthorizationStatus = function (manager, status){
        if (status === 3){
            manager.startRangingBeaconsInRegion(this._region);
        }
    };

    BeaconManagerDelegateImpl.prototype.beaconManagerDidRangeBeaconsInRegion = function (manager, nativeBeacons, region) {
        var beacons = [];

        for (var index = 0; index < nativeBeacons.count; index++){
            var beacon = nativeBeacons[index];

            beacons.push({
                major : beacon.major,
                minor: beacon.minor,
                accuracy: beacon.accuracy,
                rssi : beacon.rssi,
                _beacon : beacon
            });
        }

        this._callback(beacons);
    };
    BeaconManagerDelegateImpl.ObjCProtocols = [ESTBeaconManagerDelegate];
    return BeaconManagerDelegateImpl;
})(NSObject);

var Estimote = (function(){

  function Estimote(options){
      this._regionName = ESTIMOTE_REGION_NAME;
      this._estimote_prox_UUID = ESTIMOTE_PROXIMITY_UUID;

      if (typeof options.region !== 'undefined'){
            this._regionName = options.region;
      }
      if (typeof options.proximityUUID !== 'undefined'){
          this._estimote_prox_UUID = NSUUID.alloc().initWithUUIDString(options.proximityUUID);
      }

      this.beaconManager = ESTBeaconManager.alloc().init();
      this.beaconManager.avoidUnknownStateBeacons = true;
      this._region = CLBeaconRegion.alloc().initWithProximityUUIDIdentifier(this._estimote_prox_UUID, this._regionName);
      // delegate
      this.beaconManager.delegate = BeaconManagerDelegateImpl.new().initWithRegion(this._region, options.callback);
  }

  Estimote.prototype.startRanging = function(){
    if (ESTBeaconManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusNotDetermined){
        this.beaconManager.requestAlwaysAuthorization();
    }else{
        this.beaconManager.startRangingBeaconsInRegion(this._region);
    }
  };

  Estimote.prototype.stopRanging = function(){
      this.beaconManager.stopRangingBeaconsInRegion(this._region);
  };

  return Estimote;

})();

module.exports = Estimote;
