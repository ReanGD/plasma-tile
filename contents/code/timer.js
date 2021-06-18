Qt.include("log.js");

var _Timers = class {
    constructor() {
        this.timers = [];
    }

    addTimer(func, interval) {
        var timer = this.timers.pop() || Qt.createQmlObject("import QtQuick 2.0; Timer {}", scriptRoot);

        const callback = () => {
            try {
                timer.triggered.disconnect(callback);
            } catch (e) {
                debugException("Timer error: ", e);
            }
            try {
                func();
            } catch (e) {
                debugException("Timer error: ", e);
            }
            this.timers.push(timer);
        };

        timer.interval = interval;
        timer.repeat = false;
        timer.triggered.connect(callback);
        timer.start();
    }
}

var _timers = new _Timers();

function addTimer(func, interval) {
    _timers.addTimer(func, interval);
}
