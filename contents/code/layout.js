var TileRight = class {
    constructor(rcScreen) {
        this.rcScreen = rcScreen;
    }

    draw(clients) {
        if (clients.length == 0) {
            return;
        }
        const rcScreen = this.rcScreen;
        if (clients.length == 1) {
            clients[0].geometry = rcScreen;
            return;
        }
        const wRow0 = Math.floor(rcScreen.width / 2);
        const wRow1 = rcScreen.width - wRow0;
        const hRow1 = Math.floor(rcScreen.height / (clients.length - 1));

        var yPos = rcScreen.y;
        for (let [i, client] of clients.entries()) {
            if (i == 0) {
                client.geometry = Qt.rect(rcScreen.x, rcScreen.y, wRow0, rcScreen.height);
                continue;
            }

            // if (i == clients.length - 1) {
            // }

            client.geometry = Qt.rect(wRow0, yPos, wRow1, hRow1);
            yPos += hRow1;
        }
    }
}
