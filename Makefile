PROJECT_NAME = plasma-tile
KWIN_MAIN_SCRIPT = contents/code/Main.qml

start:
	bin/load-script.sh "$(KWIN_MAIN_SCRIPT)" "$(PROJECT_NAME)-test"

stop:
	bin/load-script.sh "unload" "$(PROJECT_NAME)-test"

.PHONY: start stop
