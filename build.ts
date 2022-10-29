import webpack from "webpack";
import path from "path";
import fs from "fs";
import { compileFile } from "pug";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

type BookmarkletConfig = {
  entry: string;
  name: string;
  label: string;
};

type BookmarkletBuild = {
  label: string;
  scriptlet: string;
};

const BOOKMARKLETS_DIR = path.join(__dirname, "src/bookmarklets");
const OUT_DIR = path.join(__dirname, "dist");

const toFileName = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s/g, "-")
    .replace(/[^a-z0-9\-]/gi, "")
    .replace(/-+/, "-")
    .replace(/^-/, "")
    .replace(/-$/, "");

const bookmarklets = fs.readdirSync(BOOKMARKLETS_DIR);
const bookmarkletConfigs: BookmarkletConfig[] = bookmarklets.map((label) => {
  return {
    entry: path.join(BOOKMARKLETS_DIR, label, "index.ts"),
    name: toFileName(label),
    label,
  };
});

const isDev = process.env.NODE_ENV === "development";

const config: webpack.Configuration = {
  mode: isDev ? "development" : "production",
  entry: {
    ...bookmarkletConfigs.reduce((map, { entry, name }) => {
      map[name] = entry;
      return map;
    }, {} as webpack.EntryObject),
    index: path.join(__dirname, "src/index.ts"),
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
  plugins: [new MiniCssExtractPlugin()],
};

const compiler = webpack(config);

compiler.outputFileSystem = fs;
compiler.run((err, stats) => {
  if (err) {
    console.error(err);
    return;
  }

  const styles = Object.keys(stats?.compilation.assets || {})
    .filter((filename) => !!filename.match(/\.css$/))
    .map((filename) => `./${filename}`);

  if (!stats) throw new Error("I got no stats");
  const basePath = stats.compilation.outputOptions.path;
  if (!basePath) throw new Error("Could not find a base path");

  const builds: BookmarkletBuild[] = bookmarkletConfigs.map(
    ({ name, label }) => {
      const p = path.join(basePath, `${name}.js`);
      let scriptlet = `javascript:${encodeURI(fs.readFileSync(p).toString())}`;

      return {
        label,
        scriptlet,
      };
    }
  );

  console.log("Build Info:");
  console.log(
    builds
      .map(({ label, scriptlet }) => `${label}: ${scriptlet.length}`)
      .join("\n")
  );

  fs.writeFileSync(
    path.join(OUT_DIR, "index.html"),
    compileFile(path.join(__dirname, "src/index.pug"))({
      builds,
      styles,
    })
  );
});
