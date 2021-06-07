watch:
	sass -w scss/:css/
run:
	web-ext run
sign:
	web-ext sign

.PHONY: watch test sign
