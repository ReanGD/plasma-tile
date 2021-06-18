Qt.include("log.js");

var BaseLayout = class {
    updateClient(client, rc) {
        client.prop.needGeometry = rc;
        client.noBorder = true;
        client.geometry = rc;
    }
}

var LayoutTileRight = class extends BaseLayout {
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
