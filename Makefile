RESULTS=website/multipage/*.html website/*.html website/*.js

update-source:
	[ -d html ] || git clone https://github.com/whatwg/html.git --depth=1
	mv html/source source

build-en: clean-en
	node ./bin/split.js

build-zh:
	node ./bin/merge.js > html/source
	[ -d html-build ] || git clone https://github.com/whatwg/html-build.git --depth=1
	HTML_OUTPUT=$(abspath website) bash html-build/build.sh -n
	sed -i 's/\/multipage/\/html\/multipage/g' $(RESULTS)
	sed -i 's/src=\/link-fixup.js/src=\/html\/link-fixup.js/g' $(RESULTS)
	sed -i "s/'\/fonts\//'\/html\/fonts\//g" $(RESULTS)
	sed -i 's/=\/images\//=\/html\/images\//g' $(RESULTS)
	sed -i 's/=\/demos\//=\/html\/demos\//g' $(RESULTS)
	sed -i 's/=\/entities.json/=\/html\/entities.json/g' $(RESULTS)

deploy:
	@echo Make sure website/ has been committed into master branch
	git subtree push --prefix website origin gh-pages

clean-en:
	rm -rf src/SUMMARY.en.md
	find src/ -name "*.en.html" -delete
	find src/ -type d -empty -delete

clean-cache:
	rm -rf html-build/.cache
