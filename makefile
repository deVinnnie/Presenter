SRC_CORE=js/Navigator.js js/Ticker.js js/StepManager.js js/SlideDeck.js js/Keyboard.js js/Mouse.js js/SlideDeckManager.js 
SRC_EXTRA=js/Curtain.js js/Touch.js js/Overview.js js/SyncClient.js

TARGET=build/presenter.js
TARGET-MIN=build/presenter-min.js
TARGET_ALL_MIN=build/presenter.all.js

CSS=css/presenter.css css/presenter.theme.css
LIBS= ./libs/jquery/dist/jquery.min.js ./libs/underscore/underscore-min.js ./libs/postal.js/lib/postal.min.js ./libs/progress.js/minified/progress.min.js

default: $(TARGET)

#Normal
$(TARGET): $(SRC_CORE) $(SRC_EXTRA) $(CSS)
	@echo "Building Javascript Files..."
	cat $(SRC_CORE) $(SRC_EXTRA) > $(TARGET)

$(TARGET-MIN) : $(TARGET)
	@echo "Minifying..." 
	cat $(TARGET) | uglifyjs > $(TARGET-MIN)

#Compile with libs included. 
$(TARGET_ALL_MIN) : $(TARGET-MIN)
	cat $(LIBS) $(TARGET-MIN) > build/presenter.all.js

#CSS
css/presenter.css: less/presenter.*.less
	lessc less/presenter.less css/tmp.css
	cat libs/progress.js/minified/progressjs.min.css css/tmp.css > css/presenter.css
	rm css/tmp.css
	
css/presenter.theme.css: less/presenter.theme.less
	lessc less/presenter.theme.less css/presenter.theme.css 

#Documentation
doc: $(SRC_CORE) $(SRC_EXTRA)
	@echo "Generating Documentation..."
	yuidoc -n ./js  -o ./doc # -n = Do not recurse over directories.

#Other
clean:
	rm -f $(TARGET)
	rm -f $(TARGET-MIN)
	rm -f $(TARGET_ALL_MIN)
	rm -f $(CSS)

.PHONY: clean css doc
