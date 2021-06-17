Qt.include("log.js");

var BaseLayout = class {
    drawClient(id, client, rc) {
        // custom
        client.clientId = id;
        // from old engine
        client.geometryRender = rc;
        // std
        // client.geometry = rc;
        client.frameGeometry = rc;
        client.noBorder = true;
    }
}

var LayoutTileRight = class extends BaseLayout {
    draw(rcScreen, clients) {
        debug(`rcScreen: y = ${rcScreen.y}, h = ${rcScreen.height}`);
        const wRow0 = Math.floor(rcScreen.width / 2);
        const wRow1 = rcScreen.width - wRow0;
        const hRow1 = Math.floor(rcScreen.height / (clients.length - 1));

        var yPos = rcScreen.y;
        for (let [i, client] of clients.entries()) {
            if (i == 0) {
                const rc = Qt.rect(rcScreen.x, rcScreen.y, wRow0, rcScreen.height);
                debug(`window (1): y = ${rc.y}, h = ${rc.height}`);
                this.drawClient(i, client, rc);
                continue;
            }

            // if (i == clients.length - 1) {
            // }
            const rc = Qt.rect(wRow0, yPos, wRow1, hRow1);
            debug(`window (2): y = ${rc.y}, h = ${rc.height}`);
            this.drawClient(i, client, rc);
            yPos += hRow1;
        }
    }
}

var Layout = class {
    constructor(desktopIndex) {
        this.impl = new LayoutTileRight();
        this.desktopIndex = desktopIndex;
    }

    draw(rcScreen, clients) {
        debug(`v2 render desktop ${this.desktopIndex}, len = ${clients.length}`);
        if (clients.length == 0) {
            return;
        }
        if (clients.length == 1) {
            this.impl.drawClient(0, clients[0], rcScreen);
            return;
        }

        this.impl.draw(rcScreen, clients);
    }
}
