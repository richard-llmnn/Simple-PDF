const path = require( 'path' );
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PurgecssPlugin = require('purgecss-webpack-plugin');
const glob = require("glob");

module.exports = {
    entry: {
        app: "./src/index.js",
    },
    mode: "development",
    output: {
        path: path.resolve( __dirname, 'dist' ),
    },
    devServer: {
        open: false,
        port: 9000,
        hot: false,
        liveReload: false,
        static: {
            directory: path.join(__dirname, 'dist'), // to make icons available because they are static generated
        },
        client: {
            progress: true,
            overlay: true,
            logging: "error",
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src/app.html"),
            inject: "head", // if is set to "body", "head" or true you have to remove the webpack tags from the template!
            favicon: false, // do not user favicon, because we set multiple icons in the template
            hash: false,
            minify: false
        }),
        new PurgecssPlugin({
            paths: glob.sync(`${path.join(__dirname, "src")}/**/*`, { nodir: true })
        }),
    ],
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
                ]
            }
        ]
    }
};
