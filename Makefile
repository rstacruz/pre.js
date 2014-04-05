all: index.js index.min.js

index.js: \
	yepnope/yepnope.js \
	yepnope/yepnope.preload.js \
	yepnope/yepnope.css-prefix.js \
	loader.js
	cat $^ > $@

index.min.js: index.js
	uglifyjs -m --comments < $^ \
		| sed 's/triggerProgress/A/g' \
		| sed 's/onprogress/B/g' \
		| sed 's/callbacks/C/g' \
		| sed 's/checks/D/g' \
		> $@
	@ echo ".min.js:   " `cat $@ | wc -c`
	@ echo ".min.js.gz:" `cat $@ | gzip | wc -c`
