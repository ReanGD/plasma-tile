#!/bin/sh

export QT_LOGGING_RULES="kwin_*=false;qt.qpa.*=false"
while :; do kwin_x11 --replace; done
