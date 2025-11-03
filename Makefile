default: run

# Set default warning mode if not specified
# permitted values debug|info|warn|error
# e.g. usage from make cli:
#  		make build log=debug
#  		make build-site log=debug
log ?= warn

help:		## list out commands with descriptions
	@sed -ne '/@sed/!s/## //p' $(MAKEFILE_LIST)

setup:		## install dependencies and compile initial CSS
	@npm install
	@make css

build:		## hugo build & compile css (one-time)
	@make css site

run: ##            run Hugo server & watch Tailwind CSS compiler
	@make -j2 run-site run-css
	# --jobs=2 parallelizes the commands

run-caddy: ## [def] run on caddy server
	@make caddy run

site:		## hugo compile build
	@hugo \
		build \
		--cleanDestinationDir --gc --minify --printI18nWarnings \
		--logLevel $(log)

css:		## compile Tailwind CSS with PostCSS
	@npx @tailwindcss/cli \
		-i ./assets/css/input.css  \
		-o ./assets/css/output.tmp.css
	@npx postcss ./assets/css/output.tmp.css -o ./assets/css/output.css
	@rm -f ./assets/css/output.tmp.css

run-css:	## run & watch Tailwind CSS compiler with PostCSS
	@npx @tailwindcss/cli \
		-i ./assets/css/input.css  \
		-o ./assets/css/output.tmp.css --watch & \
	while [ ! -f ./assets/css/output.tmp.css ]; do sleep 0.5; done && \
	npx postcss ./assets/css/output.tmp.css -o ./assets/css/output.css --watch

run-site:	## run Hugo server
	@hugo \
		server \
		--port=1313 --disableFastRender \
		--cleanDestinationDir --gc --minify --printI18nWarnings \
		--logLevel $(log) --noHTTPCache

caddy: 		## copy local Caddyfile and start Caddy server
	@cp ./CaddyFile /opt/homebrew/etc/Caddyfile
	@brew services restart caddy
	@echo "to stop caddy: brew services stop caddy"

clean:		## remove all the generated files
	rm -rf public
	rm  -f assets/css/output.css
	rm  -f assets/css/output.tmp.css

post:		## create a new post ## make post slug=test-post
	@hugo new content -k post content/blog/$$(date +%Y-%m-%d)-$(slug).md

short:		## create a new short ## make short slug=test-short
	@hugo new content -k short content/blog/$$(date +%Y-%m-%d)-$(slug).md

