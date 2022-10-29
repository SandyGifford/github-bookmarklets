import fs from "fs";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import { compileFile } from "pug";
import webpack, { Stats } from "webpack";
import {
  BOOKMARKLETS_DIR,
  IS_DEV,
  OUT_DIR,
  PUG_PATH,
  SRC_DIR,
} from "./buildConsts";
import {
  BookmarkletBuild,
  BookmarkletConfig,
  BookmarkletJSONConfig,
} from "./buildTypes";
import { makeFileSafe } from "./buildUtils";
import WatchExternalFilesPlugin from "webpack-watch-files-plugin";

const bookmarklets = fs.readdirSync(BOOKMARKLETS_DIR);
const bookmarkletConfigs: BookmarkletConfig[] = bookmarklets.map((dirName) => {
  const dirPath = path.join(BOOKMARKLETS_DIR, dirName);
  const configPath = path.join(dirPath, "config.json");
  let config: BookmarkletJSONConfig | undefined;

  if (fs.existsSync(configPath))
    config = JSON.parse(fs.readFileSync(configPath).toString());

  return {
    entry: path.join(dirPath, "index.ts"),
    name: makeFileSafe(dirName),
    label: dirName,
    ...config,
  };
});

const config: webpack.Configuration = {
  mode: IS_DEV ? "development" : "production",
  entry: {
    ...bookmarkletConfigs.reduce((map, { entry, name }) => {
      map[name] = entry;
      return map;
    }, {} as webpack.EntryObject),
    index: path.join(SRC_DIR, "index.ts"),
  },
  output: {
    path: OUT_DIR,
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(?:(?:s[ac])|(?:c))ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".scss", ".css"],
  },
  devtool: false,
  plugins: [
    new MiniCssExtractPlugin(),
    new WatchExternalFilesPlugin({
      files: [PUG_PATH, path.join(SRC_DIR, "bookmarklets/**/config.json")],
    }),
  ],
};

const buildCompiler = webpack(config);
buildCompiler.outputFileSystem = fs;

const buildCallback = (err?: null | Error, stats?: Stats) => {
  if (err) {
    console.error(err);
    return;
  }

  const styles = Object.keys(stats?.compilation.assets || {})
    .filter((filename) => !!filename.match(/\.css$/))
    .map((filename) => `${filename}`);

  if (!stats) throw new Error("I got no stats");
  const basePath = stats.compilation.outputOptions.path;
  if (!basePath) throw new Error("Could not find a base path");

  const builds: BookmarkletBuild[] = bookmarkletConfigs.map(
    ({ name, label, description }) => {
      const p = path.join(basePath, `${name}.js`);
      let scriptlet = `javascript:${encodeURI(fs.readFileSync(p).toString())}`;

      return {
        label,
        scriptlet,
        description,
      };
    }
  );

  console.log("\n\nBuild Info:");
  console.log(
    builds
      .map(({ label, scriptlet }) => `${label}: ${scriptlet.length}`)
      .join("\n")
  );

  fs.writeFileSync(
    path.join(OUT_DIR, "index.html"),
    compileFile(PUG_PATH)({
      builds,
      styles,
    })
  );
};

export { buildCompiler, buildCallback };
