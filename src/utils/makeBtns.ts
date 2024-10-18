import { makeBtn } from "./makeBtn";
import makeEl from "./makeEl";

export const makeBtns = (
  btns: { label: string; props?: Record<string, any> }[],
  containerProps?: Record<string, any>
) => {
  const btnEls = btns.map(({ label, props }) =>
    makeBtn(label, {
      ...props,
      style: {
        position: "relative",
        bottom: "auto",
        right: "auto",
        ...props?.style,
      },
    })
  );

  const btnContainerEl = makeEl(
    "div",
    {
      ...containerProps,
      style: {
        position: "fixed",
        bottom: "10px",
        right: "10px",
        zIndex: "1",
        display: "flex",
        gap: "8px",
        ...containerProps?.style,
      },
    },
    btnEls
  );

  return { btnContainerEl, btnEls };
};
