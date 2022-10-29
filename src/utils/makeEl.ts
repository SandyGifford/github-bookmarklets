export default function makeEl<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props?: Record<string, any>,
  children?: (Node | string)[]
): HTMLElementTagNameMap[K] {
  if (Array.isArray(props)) {
    children = props;
    props = undefined;
  }

  const el = document.createElement(tagName);
  Object.entries(props || {}).forEach(([key, val]) => {
    switch (key) {
      case "className":
        el.className = val as string;
        break;
      case "style":
        Object.entries(val).forEach(
          ([prop, style]) =>
            ((el.style as unknown as Record<string, unknown>)[prop] = style)
        );
        break;
      default:
        el.setAttribute(key, `${val}`);
        break;
    }
  });
  children?.forEach((child) => el.append(child));
  return el;
}
