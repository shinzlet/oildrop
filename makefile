watch:
	sass -w scss/:css/
run:
	web-ext run
sign:
	web-ext sign --api-key=$$AMO_JWT_ISSUER --api-secret=$$AMO_JWT_SECRET

.PHONY: watch test
