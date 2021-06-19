OUTPUT=$(abspath output/html)
HTMLS=$(OUTPUT)/multipage/*.html $(OUTPUT)/*.html
RESULTS=$(HTMLS) $(OUTPUT)/*.js

build: update-progress html
	node ./bin/merge.js > html/source
	[ -d html-build ] || git clone https://github.com/whatwg-cn/html-build.git --depth=1
	[ -d wattsi ] || (git clone https://github.com/whatwg/wattsi.git --depth=1 && cd wattsi && make)
	export SHA_OVERRIDE=ffffff; \
	export PATH="$$PATH":`pwd`/wattsi/bin; \
	export HTML_OUTPUT=$(OUTPUT); \
	bash html-build/build.sh --no-lint -n --no-highlight
	sed -i \
		-e 's/"\/\?multipage/"\/html\/multipage/g' \
		-e "s/'\/\?multipage/'\/html\/multipage/g" \
		-e 's/=\/\?link-fixup.js/=\/html\/link-fixup.js/g' \
		-e "s/'\/\?fonts\//'\/html\/fonts\//g" \
		-e 's/=\/\?images\//=\/html\/images\//g' \
		-e 's/=\/\?demos\//=\/html\/demos\//g' \
		-e 's/=\/\?entities.json/=\/html\/entities.json/g' \
		-e 's/href=\/dev\/styles\.css/href=\/html\/dev\/styles\.css/g' \
		-e 's/href=\/styles\.css/href=\/html\/styles\.css/g' \
		$(RESULTS)
	sed -i -r \
		-e 's/<body>/<link rel=stylesheet href=\/html\/resources\/zh-cn.css><body>/' \
		-e 's/issue-url=[^ ]+\s+src=[^ ]+/issue-url=https:\/\/github.com\/whatwg-cn\/html\/issues\/new src=\/html\/resources\/file-issue.js/' \
		-e 's/\/html-dfn\.js/\/html\/resources\/html-dfn.js/' \
		-e '$$a\<script src=\/html\/resources\/zh-cn.js></script>' \
		$(HTMLS)
	node ./bin/json-pretify.js ${OUTPUT}/multipage/fragment-links.json
	rm -rf $(OUTPUT)/resources && cp -r resources $(OUTPUT)
	cp -r images/* $(OUTPUT)/images/

html:
	./bin/update-html.sh $$(cat HTML_VERSION)

update-en: clean-html html
	./bin/update-html.sh origin/master
	cp html/source source
	rm -rf src/SUMMARY.en.md
	find src/ -name "*.en.html" -delete
	find src/ -type d -empty -delete
	node ./bin/split.js

clean-html:
	rm -rf html

update-progress:
	data=`bash ./bin/progress.sh | awk -F: '{print $$2}'`; \
	sed -i "s|当前进度.*|当前进度：$${data}|" README.md

# Split subtree before deploy:
# git subtree split --prefix output/html -b gh-pages
deploy:
	if [ -n "$$(git status --porcelain)" ]; then \
		git status; \
		echo "there are changes, please commit to master first" && exit 1; \
	fi
	git add -f output/html
	git commit -m 'dist'
	git push origin `git subtree split --prefix output/html`:gh-pages --force
	git reset output/html
	git reset HEAD^

deploy-force:
	git push origin `git subtree split --prefix output/html`:gh-pages --force
