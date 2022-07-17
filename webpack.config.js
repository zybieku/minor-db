const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

console.log(`----------- 环境 = ${process.env.NODE_ENV} ----------`);

module.exports = {
    entry: './src/index.ts',
    mode: process.env.NODE_ENV,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'minordb.min.js',
        library: {
            name: 'MinorDB',
            type: 'umd',
            umdNamedDefine: true,
            export: 'default', // 增加这个属性
        },
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                exclude: path.resolve(__dirname, 'node_modules'),
                use: "babel-loader"
            },
            {
                test: /\.(ts|tsx)$/i,
                loader: "ts-loader",
                exclude: ["/node_modules/"],
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new ESLintPlugin()
    ],
};
