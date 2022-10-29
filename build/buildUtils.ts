export const makeFileSafe = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s/g, "-")
    .replace(/[^a-z0-9\-]/gi, "")
    .replace(/-+/, "-")
    .replace(/^-/, "")
    .replace(/-$/, "");
