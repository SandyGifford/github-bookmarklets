import { config as configDotEnv } from "dotenv";
import path from "path";
configDotEnv();

export const IS_DEV = process.env.NODE_ENV === "development";
export const SRC_DIR = path.join(__dirname, "../src");
export const BOOKMARKLETS_DIR = path.join(SRC_DIR, "bookmarklets");
export const OUT_DIR = path.join(__dirname, "../dist");
export const PUG_PATH = path.join(SRC_DIR, "index.pug");
