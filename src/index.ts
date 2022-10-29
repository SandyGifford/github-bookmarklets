import "./index.style";

Array.from(document.querySelectorAll(".bookmarklet")).forEach((a) =>
  a.addEventListener("click", (e) => e.preventDefault())
);
