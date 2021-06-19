Qt.include("log.js");
Qt.include("timer.js");
Qt.include("layout.js");

var ClientProperty = class {
    constructor(numberOnDesktop) {
        this.needGeometry = Qt.rect(0, 0, 0, 0);
        this.numberOnDesktop = numberOnDesktop;
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
            // const needGeometry = this.prop.needGeometry;
            // const geometry = this.geometry;
            // const diff = Qt.rect(needGeometry.x - geometry.x, needGeometry.y - geometry.y, needGeometry.width - geometry.width, needGeometry.height - geometry.height);
            // log(`geometryChanged: number = ${this.prop.numberOnDesktop}, diff = ${diff}`);
        }.bind(client));

        this.clients.push(client);
    }

    removeClient(client) {
        this.clients.splice(client.prop.numberOnDesktop, 1);
        for (let [i, client] of this.clients.entries()) {
            client.prop.numberOnDesktop = i;
        };
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

var PlasmaTile = class {
    constructor() {
        this.screens = [];
    }

    init() {
        log(`Plasma Tile: started (screens = ${workspace.numScreens}, desktops = ${workspace.desktops})`);

        for (var i=0; i!=workspace.numScreens; i++) {
            this.screens.push(new PlasmaScreen(i));
        }
        this.loadClients();
        this.subscribeToWorkspaceSignals();
        this.updateAll();
    }

    _isTiled(client) {
        return (client.normalWindow && !client.modal)
    }

    update(screenNumber, desktopNumber) {
        this.screens[screenNumber].update(desktopNumber);
    }

    updateAfterTimeout(screenNumber, desktopNumber) {
        addTimer(function() {
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
            if (!this._isTiled(client)) {
                continue;
            }

            const desktopNum = client.desktop - 1;
            this.screens[client.screen].addClient(client);
            log(`cur: desktop = ${desktopNum}, screen = ${client.screen}, number = ${client.prop.numberOnDesktop}`);
        }
    }

    _subscribeToSignal(signal, handler) {
        const wrapper = (...args) => {
            try {
                handler.apply(this, args);
            } catch (e) {
                logException("Signal handler error: ", e);
            }
        };

        signal.connect(wrapper);
    }

    subscribeToWorkspaceSignals() {
        this._subscribeToSignal(workspace.clientAdded, (client) => {
            if (!this._isTiled(client)) {
                return;
            }

            const desktopNum = client.desktop - 1;
            this.screens[client.screen].addClient(client);
            log(`add: desktop = ${desktopNum}, screen = ${client.screen}, number = ${client.prop.numberOnDesktop}`);
            this.updateAfterTimeout(client.screen, desktopNum);
        });

        this._subscribeToSignal(workspace.clientRemoved, (client) => {
            if (!this._isTiled(client)) {
                return;
            }

            const desktopNum = client.desktop - 1;
            this.screens[client.screen].removeClient(client);
            log(`del: desktop = ${desktopNum}, screen = ${client.screen}, number = ${client.prop.numberOnDesktop}`);
            this.updateAfterTimeout(client.screen, desktopNum);
        });

        this._subscribeToSignal(workspace.clientMinimized, (client) => {
            if (!this._isTiled(client)) {
                return;
            }

            const desktopNum = client.desktop - 1;
            log(`min: desktop = ${desktopNum}, screen = ${client.screen}, number = ${client.prop.numberOnDesktop}`);
        });

        this._subscribeToSignal(workspace.clientUnminimized, (client) => {
            if (!this._isTiled(client)) {
                return;
            }

            const desktopNum = client.desktop - 1;
            log(`unMin: desktop = ${desktopNum}, screen = ${client.screen}, number = ${client.prop.numberOnDesktop}`);
        });
    }
}

function main() {
    var obj = new PlasmaTile();
    obj.init();
}
