import { makeBtn } from "../../utils/makeBtn";

const BUTTON_CLASS_NAME = "getTicketListButton";

document
  .querySelectorAll(`.${BUTTON_CLASS_NAME}`)
  .forEach((btn) => btn.parentElement?.removeChild(btn));

const btn = makeBtn("Copy ticket list to clipboard", {
  className: BUTTON_CLASS_NAME,
});

document.body.append(btn);

btn.addEventListener("click", async () => {
  const message = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      "a[href^='/reclaim/issue/RAI-']"
    )
  )
    .map((a) => {
      if (!a.querySelector<HTMLInputElement>("input[checked]")?.checked) return;
      const title = a.querySelector("span[color='labelTitle']")?.textContent;
      const url = new URL(a.href).href;
      const [ticketNum] = a.href.match(/(RAI-\d+)/) || [];
      return `- ${title} ([${ticketNum}](${url}))`;
    })
    .filter((i) => !!i)
    .join("\n");

  await navigator.clipboard.writeText(message);
  alert("copied!");
});
