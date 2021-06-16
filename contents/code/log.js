const DEBUG = {
    enabled: true,
};

function debug(text) {
    if (DEBUG.enabled) {
        console.log(text);
    }
}
