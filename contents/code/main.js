Qt.include("log.js");

var ClientProperty = class {
    constructor(numberOnDesktop) {
        this.numberOnDesktop = numberOnDesktop;
    }
}

var PlasmaDesktop = class {
    constructor() {
        this.clients = []
    }

    init() {
    }

    addClient(client) {
        client.prop = new ClientProperty(this.clients.length);
        this.clients.push(client);
    }

    removeClient(client) {
        this.clients.splice(client.prop.numberOnDesktop, 1);
    }
}

var PlasmaScreen = class {
    constructor() {
        this.desktops = []
    }

    init() {
        for (var i=0; i!=workspace.desktops; i++) {
            var desktop = new PlasmaDesktop();
            desktop.init();
            this.desktops.push(desktop);
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
}

var PlasmaTile = class {
    constructor() {
        this.screens = [];
    }

    init() {
        debug(`Plasma Tile: started (screens = ${workspace.numScreens}, desktops = ${workspace.desktops})`);

        for (var i=0; i!=workspace.numScreens; i++) {
            var screen = new PlasmaScreen();
            screen.init();
            this.screens.push(screen);
        }
        this.loadClients();
        this.subscribeToWorkspaceSignals();
    }

    loadClients() {
        const clients = workspace.clientList();
        for (var i= 0; i!=clients.length; i++) {
            const client = clients[i];
            if (!client.normalWindow) {
                continue;
            }

            debug(`cur: desktop = ${client.desktop}, screen = ${client.screen}, caption = ${client.caption}`);
            this.screens[client.screen].addClient(client);
        }
    }

    subscribeToWorkspaceSignals() {
        workspace.clientAdded.connect(function(client) {
            if (!client.normalWindow) {
                return;
            }

            debug(`add: desktop = ${client.desktop}, screen = ${client.screen}, caption = ${client.caption}`);
            this.screens[client.screen].addClient(client);
        }.bind(this));

        workspace.clientRemoved.connect(function(client) {
            if (!client.normalWindow) {
                return;
            }

            debug(`del: desktop = ${client.desktop}, screen = ${client.screen}, caption = ${client.caption}`);
            this.screens[client.screen].removeClient(client);
        }.bind(this));

        workspace.clientMinimized.connect(function(client) {
            if (!client.normalWindow) {
                return;
            }
            debug(`min: desktop = ${client.desktop}, screen = ${client.screen}, caption = ${client.caption}`);
        }.bind(this));

        workspace.clientUnminimized.connect(function(client) {
            if (!client.normalWindow) {
                return;
            }
            debug(`unMin: desktop = ${client.desktop}, screen = ${client.screen}, caption = ${client.caption}`);
        }.bind(this));
    }
}

function main() {
    var obj = new PlasmaTile();
    obj.init();
}
