import makeEl from "./makeEl";

export default function makeBtn(
  label: string,
  props?: Record<string, any>
): HTMLButtonElement {
  return makeEl(
    "button",
    {
      ...props,
      style: {
        position: "fixed",
        bottom: "10px",
        right: "10px",
        padding: "10px 20px",
        background: "#334",
        color: "white",
        fontWeight: "bold",
        border: "none",
        borderRadius: "10px",
        fontSize: "20px",
        zIndex: "1",
        ...props?.style,
      },
    },
    [label]
  );
}
