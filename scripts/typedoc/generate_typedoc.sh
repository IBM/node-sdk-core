./node_modules/.bin/typedoc --mode file --theme ./scripts/typedoc/theme --excludeExternals \
    --out ./doc \
    ./lib/base_service.ts ./lib/content-type.ts \
    ./lib/helper.ts ./lib/querystring.ts \
    ./lib/requestwrapper.ts \
    ./lib/stream-to-promise.ts --target "ES5"
