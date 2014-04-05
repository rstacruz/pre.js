all: index.js index.min.js

index.js: \
	yepnope/yepnope.js \
	yepnope/yepnope.prefixes.js \
	loader.js
	cat $^ > $@

index.min.js: index.js
	uglifyjs -m --comments < $^ \
		| sed 's/triggerProgress/A/g' \
		| sed 's/onprogress/B/g' \
		| sed 's/callbacks/C/g' \
		| sed 's/checks/D/g' \
		| sed 's/retryResource/E/g' \
		> $@
	@ echo ".min.js:   " `cat $@ | wc -c`
	@ echo ".min.js.gz:" `cat $@ | gzip | wc -c`
