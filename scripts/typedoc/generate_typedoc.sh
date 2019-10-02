./node_modules/.bin/typedoc --mode file --theme ./scripts/typedoc/theme --excludeExternals \
    --out ./doc \
    ./lib/base-service.ts ./lib/content-type.ts \
    ./lib/helper.ts ./lib/querystring.ts \
    ./lib/request-wrapper.ts \
    ./lib/stream-to-promise.ts --target "ES5"
