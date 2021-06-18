Qt.include("log.js");
Qt.include("layout.js");

var ClientProperty = class {
    constructor(numberOnDesktop) {
        this.numberOnDesktop = numberOnDesktop;
        this.needGeometry = Qt.rect(0, 0, 0, 0);
    }
}

var PlasmaDesktop = class {
    constructor() {
        this.clients = []
        this.layout = new Layout();
    }

    addClient(client) {
        client.prop = new ClientProperty(this.clients.length);
        client.geometryChanged.connect(function() {
            const needGeometry = this.prop.needGeometry;
            const geometry = this.geometry;
            const diff = Qt.rect(needGeometry.x - geometry.x, needGeometry.y - geometry.y, needGeometry.width - geometry.width, needGeometry.height - geometry.height);
            debug(`geometryChanged: number = ${this.prop.numberOnDesktop}, diff = ${diff}`);
        }.bind(client));

        this.clients.push(client);
    }

    removeClient(client) {
        this.clients.splice(client.prop.numberOnDesktop, 1);
    }

    update(rcScreen) {
        this.layout.update(rcScreen, this.clients);
    }
}

var PlasmaScreen = class {
    constructor(number) {
        this.number = number;
        this.desktops = []
        for (var i=0; i!=workspace.desktops; i++) {
            this.desktops.push(new PlasmaDesktop());
        }
    }

    addClient(client) {
        const desktopNum = client.desktop - 1;
        this.desktops[desktopNum].addClient(client);
    }

    removeClient(client) {
        const desktopNum = client.desktop - 1;
        this.desktops[desktopNum].removeClient(client);
    }

    update(desktopNumber) {
        const rcScreen = workspace.clientArea(0, this.number, desktopNumber + 1);
        this.desktops[desktopNumber].update(rcScreen);
    }

    updateAll() {
        for (var i=0; i!=this.desktops.length; i++) {
            this.update(i);
        }
    }
}

var Timers = class {
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

var PlasmaTile = class {
    constructor() {
        this.screens = [];
        this.timers = new Timers();
    }

    init() {
        debug(`Plasma Tile: started (screens = ${workspace.numScreens}, desktops = ${workspace.desktops})`);

        for (var i=0; i!=workspace.numScreens; i++) {
            this.screens.push(new PlasmaScreen(i));
        }
        this.loadClients();
        this.subscribeToWorkspaceSignals();
        this.updateAll();
    }

    update(screenNumber, desktopNumber) {
        this.screens[screenNumber].update(desktopNumber);
    }

    updateAfterTimeout(screenNumber, desktopNumber) {
        this.timers.addTimer(function() {
            debug("update");
            this.screens[screenNumber].update(desktopNumber);
        }.bind(this), 50);
    }

    updateAll() {
        for (var i=0; i!=this.screens.length; i++) {
            this.screens[i].updateAll();
        }
    }

    loadClients() {
        const clients = workspace.clientList();
        for (var i= 0; i!=clients.length; i++) {
            const client = clients[i];
            if (!client.normalWindow) {
                continue;
            }

            const desktopNum = client.desktop - 1;
            this.screens[client.screen].addClient(client);
            debug(`cur: desktop = ${desktopNum}, screen = ${client.screen}, number = ${client.prop.numberOnDesktop}`);
        }
    }

    subscribeToWorkspaceSignals() {
        workspace.clientAdded.connect(function(client) {
            if (!client.normalWindow) {
                return;
            }

            const desktopNum = client.desktop - 1;
            this.screens[client.screen].addClient(client);
            debug(`add: desktop = ${desktopNum}, screen = ${client.screen}, number = ${client.prop.numberOnDesktop}`);
            this.updateAfterTimeout(client.screen, desktopNum);
        }.bind(this));

        workspace.clientRemoved.connect(function(client) {
            if (!client.normalWindow) {
                return;
            }

            const desktopNum = client.desktop - 1;
            this.screens[client.screen].removeClient(client);
            debug(`del: desktop = ${desktopNum}, screen = ${client.screen}, number = ${client.prop.numberOnDesktop}`);
            this.updateAfterTimeout(client.screen, desktopNum);
        }.bind(this));

        workspace.clientMinimized.connect(function(client) {
            if (!client.normalWindow) {
                return;
            }

            const desktopNum = client.desktop - 1;
            debug(`min: desktop = ${desktopNum}, screen = ${client.screen}, number = ${client.prop.numberOnDesktop}`);
        }.bind(this));

        workspace.clientUnminimized.connect(function(client) {
            if (!client.normalWindow) {
                return;
            }

            const desktopNum = client.desktop - 1;
            debug(`unMin: desktop = ${desktopNum}, screen = ${client.screen}, number = ${client.prop.numberOnDesktop}`);
        }.bind(this));
    }
}

function main() {
    var obj = new PlasmaTile();
    obj.init();
}
