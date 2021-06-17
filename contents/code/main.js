Qt.include("log.js");
Qt.include("layout.js");

var ClientProperty = class {
    constructor(numberOnDesktop) {
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
        this.clients.push(client);

        client.geometryChanged.connect(function() {
            debug(`geometryChanged`);
        });
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

var PlasmaTile = class {
    constructor() {
        this.screens = [];
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
            debug(`cur: desktop = ${desktopNum}, screen = ${client.screen}, caption = ${client.caption}`);
            this.screens[client.screen].addClient(client);
        }
    }

    subscribeToWorkspaceSignals() {
        workspace.clientAdded.connect(function(client) {
            if (!client.normalWindow) {
                return;
            }

            const desktopNum = client.desktop - 1;
            debug(`add: desktop = ${desktopNum}, screen = ${client.screen}, caption = ${client.caption}`);
            this.screens[client.screen].addClient(client);
            this.screens[client.screen].update(desktopNum);
        }.bind(this));

        workspace.clientRemoved.connect(function(client) {
            if (!client.normalWindow) {
                return;
            }

            const desktopNum = client.desktop - 1;
            debug(`del: desktop = ${desktopNum}, screen = ${client.screen}, caption = ${client.caption}`);
            this.screens[client.screen].removeClient(client);
            this.screens[client.screen].update(desktopNum);
        }.bind(this));

        workspace.clientMinimized.connect(function(client) {
            if (!client.normalWindow) {
                return;
            }

            const desktopNum = client.desktop - 1;
            debug(`min: desktop = ${desktopNum}, screen = ${client.screen}, caption = ${client.caption}`);
        }.bind(this));

        workspace.clientUnminimized.connect(function(client) {
            if (!client.normalWindow) {
                return;
            }

            const desktopNum = client.desktop - 1;
            debug(`unMin: desktop = ${desktopNum}, screen = ${client.screen}, caption = ${client.caption}`);
        }.bind(this));
    }
}

function main() {
    var obj = new PlasmaTile();
    obj.init();
}
