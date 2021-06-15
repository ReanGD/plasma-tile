PROJECT_NAME = plasma-tile
KWIN_MAIN_SCRIPT = contents/code/Main.qml

start:
	bin/load-script.sh "$(KWIN_MAIN_SCRIPT)" "$(PROJECT_NAME)-test"

stop:
	bin/load-script.sh "unload" "$(PROJECT_NAME)-test"

install_local_link:
	@mkdir -p ~/.local/share/kwin/scripts/plasma-tile
	@mkdir -p ~/.local/share/kservices5
	@ln -sf `pwd`/contents ~/.local/share/kwin/scripts/plasma-tile/contents
	@ln -sf `pwd`/metadata.desktop ~/.local/share/kwin/scripts/plasma-tile/metadata.desktop
	@ln -sf `pwd`/metadata.desktop ~/.local/share/kservices5/plasma-tile.desktop

.PHONY: start stop install_local_link
