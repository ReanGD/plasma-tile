Qt.include("log.js");

var Direction = {
    Up: 0,
    Down: 1,
    Left: 2,
    Right: 3,
};

var BaseLayout = class {
    updateClient(client, rc) {
        client.prop.needGeometry = rc;
        client.noBorder = true;
        client.geometry = rc;
    }
}

var LayoutTileRight = class extends BaseLayout {
    nextClientByDirection(clients, currentID, dir) {
        switch(dir) {
            case Direction.Up:
                if (currentID <= 1) {
                    return clients[currentID];
                }
                return clients[currentID - 1];
            case Direction.Down:
                if ((currentID == 0) || (currentID == clients.length - 1)) {
                    return clients[currentID];
                }
                return clients[currentID + 1];
            case Direction.Left:
                return clients[0];
            case Direction.Right:
                if (currentID == 0) {
                    return clients[1];
                }
                return clients[currentID];
            default:
                return clients[currentID];
        }
    }

    update(rcScreen, clients) {
        const wRow0 = Math.floor(rcScreen.width / 2);
        const wRow1 = rcScreen.width - wRow0;
        const hRow1 = Math.floor(rcScreen.height / (clients.length - 1));

        var yPos = rcScreen.y;
        for (let [i, client] of clients.entries()) {
            if (i == 0) {
                const rc = Qt.rect(rcScreen.x, rcScreen.y, wRow0, rcScreen.height);
                this.updateClient(client, rc);
                continue;
            }

            // if (i == clients.length - 1) {
            // }
            const rc = Qt.rect(wRow0, yPos, wRow1, hRow1);
            this.updateClient(client, rc);
            yPos += hRow1;
        }
    }
}

var Layout = class {
    constructor() {
        this.impl = new LayoutTileRight();
    }

    nextClientByDirection(clients, currentClient, dir) {
        if (clients.length == 0) {
            return currentClient;
        }
        if (clients.length == 1) {
            return clients[0];
        }
        if (!currentClient.prop) {
            return clients[0];
        }
        return this.impl.nextClientByDirection(clients, currentClient.prop.numberOnDesktop, dir);
    }

    update(rcScreen, clients) {
        if (clients.length == 0) {
            return;
        }
        if (clients.length == 1) {
            this.impl.updateClient(clients[0], rcScreen);
            return;
        }
        this.impl.update(rcScreen, clients);
    }
}
