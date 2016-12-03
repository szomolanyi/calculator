module.exports = {
    entry: "./src/index.js",  //náš vstupní bod aplikace
    output: {
        filename: "bundle.js"   //výstupní balík všech zdrojových kódů
    },
    module: { //sem budeme zanedlouho vkládat transformační moduly
        loaders : [
            {
                test: /.css$/,
                loader: "style!css",
                exclude: "node_modules"
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader'
            }
        ]
    }
};
