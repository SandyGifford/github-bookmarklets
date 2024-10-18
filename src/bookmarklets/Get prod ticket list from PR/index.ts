import { makeBtns } from "../../utils/makeBtn";

const BUTTON_CLASS_NAME = "getTicketListButton";

document
  .querySelectorAll(`.${BUTTON_CLASS_NAME}`)
  .forEach((btn) => btn.parentElement?.removeChild(btn));

const { btnContainerEl, btnEls } = makeBtns([
  {
    label: "Copy ticket list with header to clipboard",
    props: {
      className: BUTTON_CLASS_NAME,
    },
  },
  {
    label: "Copy ticket list only to clipboard",
    props: {
      className: BUTTON_CLASS_NAME,
    },
  },
]);

const [listWithHeaderBtn, listOnlyBtn] = btnEls;

document.body.append(btnContainerEl);

const startThink = () => {
  btnEls.forEach((el) => {
    el.style.pointerEvents = "none";
    el.style.opacity = "0.5";
  });
};

const stopThink = () => {
  btnEls.forEach((el) => {
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";
  });
};

stopThink();

const arrayToList = (arr: (string | undefined)[]) =>
  arr
    .map((i) => i?.trim())
    .filter((i) => !!i)
    .join("\n");

const getTicketList = () => {
  const foundPRs: Record<string, true> = {};
  const foundTickets: Record<string, true> = {};

  return Promise.all(
    Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".TimelineItem .issue-link")
    )
      .filter(
        (a) =>
          !!a.href.match(
            /^https:\/\/github.com\/[0-9a-z\-_]+?\/[0-9a-z\-_]+?\/pull/i
          )
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
                  foundTickets[ticketNum] = true;

                  return `- ${title} ([${ticketNum}](${link.href}), ${prLinkMarkdown})`;
                })
            );
          });
      })
  ).then(arrayToList);
};

const beginCopyTask = async (task: () => Promise<string>) => {
  startThink();
  const message = await task();

  await navigator.clipboard.writeText(message);

  stopThink();
  alert("copied!");
};

listWithHeaderBtn.addEventListener("click", async () => {
  const d = new Date();
  beginCopyTask(
    async () =>
      `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}` +
      "\n" +
      window.location.href +
      "\n" +
      (await getTicketList())
  );
});

listOnlyBtn.addEventListener("click", async () => beginCopyTask(getTicketList));
