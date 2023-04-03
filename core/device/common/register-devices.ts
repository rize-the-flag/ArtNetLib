import {DeviceFactory} from "./factory";
import {MixPanel150} from "../MixPanel150/mix-panel150";
import {DummyDevice} from "../dummy/dummy";

//DMX devices that are implemented natively in library registered here
DeviceFactory.registerDevice("MixPanel150", MixPanel150);
DeviceFactory.registerDevice('Dummy', DummyDevice);

