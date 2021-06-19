const LOG = {
    enabled: true,
};

function log(text) {
    if (LOG.enabled) {
        console.log(text);
    }
}

function logException(text, e) {
    if (LOG.enabled) {
        if (e.message) {
            text += e.message;
        }
        if (e.stack) {
            text += ` | stack: ${e.stack}`;
        }
        console.log(text);
    }
}
