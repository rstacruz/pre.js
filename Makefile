all: index.js index.min.js

index.js: \
	yepnope/yepnope.js \
	yepnope/yepnope.prefixes.js \
	pre.js
	(echo "/* Autogenerated; don't modify this file. Edit 'pre.js' instead. */\n\n\n\n\n;(function(){"; cat $^; echo "})();") > $@

index.min.js: index.js
	uglifyjs -m --comments < $^ \
		| sed 's/triggerProgress/A/g' \
		| sed 's/triggerRetry/B/g' \
		| sed 's/callbacks/C/g' \
		| sed 's/checks/D/g' \
		| sed 's/retryResource/E/g' \
		> $@
	@ echo ".min.js:   " `cat $@ | wc -c`
	@ echo ".min.js.gz:" `cat $@ | gzip | wc -c`
