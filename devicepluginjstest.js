import { getSatellites } from "./wheretheissat.mjs";
import { getSatelliteData } from "./wheretheissat.mjs";

var pluginTimer;

export function init() {
    console.warn("JS init called!");
}

export function discoverDevices(info) {
    getSatellites( (response) => {
        for (var i = 0; i < response.length; i++) {
            var params = [];
            var param = {};
            param.paramTypeId = "1d10b8e2-aea4-495c-8b1f-f44ef088f667";
            param.value = response[i].id
            params.push(param)
            info.addDeviceDescriptor("4bdedd0b-e268-4671-9b3e-948c853b7b9b", response[i].name, "Satellite", params);
       };
       info.finish(Device.DeviceErrorNoError);
    });
}

export function setupDevice(info) {
    var device = info.device;
    var satelliteId = info.device.paramValue("1d10b8e2-aea4-495c-8b1f-f44ef088f667");
    if (satelliteId === undefined) {
        console.warn("Could not find satelliteId in params")
        info.finish(Device.DeviceErrorMissingParameter);
        return;
    }

    getSatelliteData(satelliteId, (response) => {
        device.setStateValue("d702143f-9454-412b-88df-83b5655a5000", response.latitude)
        device.setStateValue("42d9b2a1-0e51-4a92-9804-8f6f68ed6fd1", response.longitude)
        info.finish(Device.DeviceErrorNoError);

        pluginTimer = hardwareManager.pluginTimerManager.registerTimer(5);
        pluginTimer.timeout.connect(function() {
            getSatelliteData(satelliteId, (response) => {
                device.setStateValue("d702143f-9454-412b-88df-83b5655a5000", response.latitude)
                device.setStateValue("42d9b2a1-0e51-4a92-9804-8f6f68ed6fd1", response.longitude)
            })
        })
    });
}

export function deviceRemoved(device) {
    hardwareManager.pluginTimerManager.unregisterTimer(pluginTimer);
}

