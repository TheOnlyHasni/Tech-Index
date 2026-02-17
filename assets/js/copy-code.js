(function () {
  const copyIcon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  const successIcon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  function addCopyButtons() {
    const highlights = document.querySelectorAll(".highlight");

    highlights.forEach((highlight) => {
      if (highlight.querySelector(".copy-code-button")) return;

      const button = document.createElement("button");
      button.className = "copy-code-button";
      button.type = "button";
      button.innerHTML = copyIcon;
      button.setAttribute("aria-label", "Copy code");

      button.addEventListener("click", () => {
        const codeblocks = highlight.querySelectorAll("code");
        const lastCodeblock = codeblocks[codeblocks.length - 1];
        const code = lastCodeblock.innerText;

        navigator.clipboard
          .writeText(code)
          .then(() => {
            button.innerHTML = successIcon;
            button.classList.add("copied");

            setTimeout(() => {
              button.innerHTML = copyIcon;
              button.classList.remove("copied");
            }, 2000);
          })
          .catch((err) => {
            console.error("Failed to copy code: ", err);
          });
      });

      // Add Language Label
      const codeElement = highlight.querySelector("code[data-lang]");
      if (codeElement) {
        const lang = codeElement.getAttribute("data-lang").toLowerCase();
        const langLabel = document.createElement("span");
        langLabel.className = "code-lang-label";
        langLabel.innerText = lang;
        highlight.appendChild(langLabel);
      }

      highlight.appendChild(button);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addCopyButtons);
  } else {
    addCopyButtons();
  }
})();
