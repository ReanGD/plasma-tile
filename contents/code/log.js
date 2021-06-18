const DEBUG = {
    enabled: true,
};

function debug(text) {
    if (DEBUG.enabled) {
        console.log(text);
    }
}

function debugException(text, e) {
    if (DEBUG.enabled) {
        if (e.message) {
            text += e.message;
        }
        if (e.stack) {
            text += ` | stack: ${e.stack}`;
        }
        console.log(text);
    }
}
