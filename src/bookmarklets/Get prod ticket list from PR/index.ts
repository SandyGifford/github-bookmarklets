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
  const foundPRs: Record<string, true> = {};
  const foundTickets: Record<string, true> = {};

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

        if (!prNum || foundPRs[prNum]) return;
        foundPRs[prNum] = true;

        const prLinkMarkdown = prNum && `[PR#${prNum}](${href})`;

        return fetch(href)
          .then((r) => r.text())
          .then((str) => {
            const html = document.createElement("html");
            html.innerHTML = str;

            const commentDivs = Array.from(
              html.querySelectorAll(".timeline-comment")
            ).filter(
              (c) => c.querySelector(".author")?.textContent === "linear"
            );

            if (!commentDivs.length) {
              const altText = a.parentElement
                ?.querySelector(".Link--secondary")
                ?.textContent?.replace(/ \($/, "");
              if (altText) return `- ${altText} (${prLinkMarkdown})`;
              else return `- ${prLinkMarkdown}`;
            }

            return arrayToList(
              commentDivs
                .flatMap((div) =>
                  Array.from(
                    div.querySelectorAll<HTMLAnchorElement>(
                      ".edit-comment-hide .d-block a"
                    )
                  )
                )
                .map((link) => {
                  const [, ticketNum, title] =
                    link.textContent?.match(/^(RAI-\d+) (.*)$/) || [];

                  if (!ticketNum || foundTickets[ticketNum]) return;
                  foundPRs[ticketNum] = true;

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
