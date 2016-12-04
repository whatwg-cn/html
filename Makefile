update-source:
	[ -d html ] || git clone https://github.com/whatwg/html.git --depth=1
	mv html/source source

build-en: clean-en
	node ./bin/split.js

build-zh:
	node ./bin/merge.js \
		| sed 's/"\/images\//"\/html\/images\//g' \
		| sed "s/'\/fonts\//'\/html\/fonts\//g" \
		| sed 's/"\/demos\//"\/html\/demos\//g' \
		| sed 's/\/entities.json/\/html\/entities.json/g' \
		> html/source
	[ -d html-build ] || git clone https://github.com/whatwg/html-build.git --depth=1
	HTML_OUTPUT=$(abspath website) bash html-build/build.sh
	sed -i 's/\/multipage/\/html\/multipage/g' website/*
	sed -i 's/\/link-fixup.js/\/html\/link-fixup.js/g' website/multipage/*

deploy:
	echo make sure website/ has been committed into master branch
	git subtree push --prefix website origin gh-pages

clean-en:
	rm -rf src/SUMMARY.en.md
	find src/ -name "*.en.html" -delete
	find src/ -type d -empty -delete
