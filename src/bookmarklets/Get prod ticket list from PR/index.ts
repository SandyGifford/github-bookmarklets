import makeBtn from "../../utils/makeBtn";
import makeEl from "../../utils/makeEl";

const BUTTON_CLASS_NAME = "getTicketListButton";

document
  .querySelectorAll(`.${BUTTON_CLASS_NAME}`)
  .forEach((btn) => btn.parentElement?.removeChild(btn));

const btn = makeBtn("Copy ticket list to clipboard", {
  className: BUTTON_CLASS_NAME,
});

document.body.append(btn);

const startThink = () => {
  btn.style.pointerEvents = "none";
  btn.style.opacity = "0.5";
};

const stopThink = () => {
  btn.style.pointerEvents = "auto";
  btn.style.opacity = "1";
};

stopThink();

const arrayToList = (arr: (string | undefined)[]) =>
  arr
    .map((i) => i?.trim())
    .filter((i) => !!i)
    .join("\n");

btn.addEventListener("click", async () => {
  startThink();

  const message = await Promise.all(
    Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".TimelineItem .issue-link")
    )
      .filter(
        (a) =>
          a.href.indexOf(
            "https://github.com/reclaim-ai/reclaim-worklifecalendar/pull/"
          ) === 0
      )
      .map((a) => {
        const { href } = a;
        const [prNum] = href.match(/(\d+)$/) || [];
        const prLinkMarkdown = prNum && `[PR#${prNum}](${href})`;

        return fetch(href)
          .then((r) => r.text())
          .then((str) => {
            const html = document.createElement("html");
            html.innerHTML = str;

            const commentDiv = Array.from(
              html.querySelectorAll(".timeline-comment")
            ).find((c) => c.querySelector(".author")?.textContent === "linear");

            if (!commentDiv) {
              if (!prNum) return;
              const altText = a.parentElement
                ?.querySelector(".Link--secondary")
                ?.textContent?.replace(/ \($/, "");
              if (altText) return `- ${altText} (${prLinkMarkdown})`;
              else return `- ${prLinkMarkdown}`;
            }

            return arrayToList(
              Array.from(
                commentDiv.querySelectorAll<HTMLAnchorElement>(
                  ".edit-comment-hide .d-block a"
                )
              ).map((link) => {
                const [, ticketNum, title] =
                  link.textContent?.match(/^(RAI-\d+) (.*)$/) || [];
                if (!ticketNum) return;
                return `- ${title} ([${ticketNum}](${link.href}), ${prLinkMarkdown})`;
              })
            );
          });
      })
  ).then(arrayToList);

  await navigator.clipboard.writeText(message);

  stopThink();
  alert("copied!");
});
