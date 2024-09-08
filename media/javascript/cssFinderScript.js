document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const resultList = document.getElementById("resultList");
  const vscode = acquireVsCodeApi();

  const base64CopyIcon =
    "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNjQgNjQiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnIGlkPSJTVkdSZXBvX2JnQ2FycmllciIgc3Ryb2tlLXdpZHRoPSIwIj48L2c+PGcgaWQ9IlNWR1JlcG9fdHJhY2VyQ2FycmllciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L2c+PGcgaWQ9IlNWR1JlcG9faWNvbkNhcnJpZXIiPiA8ZyBpZD0iVGV4dC1maWxlcyI+IDxwYXRoIGQ9Ik01My45NzkxNDg5LDkuMTQyOTAwNUg1MC4wMTA4NDljLTAuMDgyNjk4OCwwLTAuMTU2MjAwNCwwLjAyODM5OTUtMC4yMzMxMDA5LDAuMDQ2OTk5OVY1LjAyMjggQzQ5Ljc3Nzc0ODEsMi4yNTMsNDcuNDczMTQ4MywwLDQ0LjYzOTg0NjgsMGgtMzQuNDIyNTk2QzcuMzgzOTUxNywwLDUuMDc5MzUxOSwyLjI1Myw1LjA3OTM1MTksNS4wMjI4djQ2Ljg0MzI5OTkgYzAsMi43Njk3OTgzLDIuMzA0NTk5OCw1LjAyMjgwMDQsNS4xMzc4OTk5LDUuMDIyODAwNGg2LjAzNjcwMDJ2Mi4yNjc4OTg2QzE2LjI1Mzk1Miw2MS44Mjc0MDAyLDE4LjQ3MDI1MTEsNjQsMjEuMTk1NDUxNyw2NCBoMzIuNzgzNjk5YzIuNzI1MjAwNywwLDQuOTQxNDk3OC0yLjE3MjU5OTgsNC45NDE0OTc4LTQuODQzMjAwN1YxMy45ODYxMDAyIEM1OC45MjA2NDY3LDExLjMxNTUwMDMsNTYuNzA0MzQ5NSw5LjE0MjkwMDUsNTMuOTc5MTQ4OSw5LjE0MjkwMDV6IE03LjExMTA1MTYsNTEuODY2MTAwM1Y1LjAyMjggYzAtMS42NDg3OTk5LDEuMzkzODk5OS0yLjk5MDk5OTksMy4xMDYyMDAyLTIuOTkwOTk5OWgzNC40MjI1OTZjMS43MTIzMDMyLDAsMy4xMDYyMDEyLDEuMzQyMiwzLjEwNjIwMTIsMi45OTA5OTk5djQ2Ljg0MzI5OTkgYzAsMS42NDg3OTk5LTEuMzkzODk4LDIuOTkxMTAwMy0zLjEwNjIwMTIsMi45OTExMDAzaC0zNC40MjI1OTZDOC41MDQ5NTE1LDU0Ljg1NzIwMDYsNy4xMTEwNTE2LDUzLjUxNDkwMDIsNy4xMTEwNTE2LDUxLjg2NjEwMDN6IE01Ni44ODg4NDc0LDU5LjE1Njc5OTNjMCwxLjU1MDYwMi0xLjMwNTUsMi44MTE1MDA1LTIuOTA5Njk4NSwyLjgxMTUwMDVoLTMyLjc4MzY5OSBjLTEuNjA0MjAwNCwwLTIuOTA5Nzk5Ni0xLjI2MDg5ODYtMi45MDk3OTk2LTIuODExNTAwNXYtMi4yNjc4OTg2aDI2LjM1NDE5NDYgYzIuODMzMzAxNSwwLDUuMTM3OTAxMy0yLjI1MzAwMjIsNS4xMzc5MDEzLTUuMDIyODAwNFYxMS4xMjc1OTk3YzAuMDc2OTAwNSwwLjAxODYwMDUsMC4xNTA0MDIxLDAuMDQ2OTk5OSwwLjIzMzEwMDksMC4wNDY5OTk5IGgzLjk2ODI5OTljMS42MDQxOTg1LDAsMi45MDk2OTg1LDEuMjYwOTAwNSwyLjkwOTY5ODUsMi44MTE1MDA1VjU5LjE1Njc5OTN6Ij48L3BhdGg+IDxwYXRoIGQ9Ik0zOC42MDMxNDk0LDEzLjIwNjM5OTlIMTYuMjUzOTUyYy0wLjU2MTUwMDUsMC0xLjAxNTkwMDYsMC40NTQyOTk5LTEuMDE1OTAwNiwxLjAxNTgwMDUgYzAsMC41NjE1OTk3LDAuNDU0NDAwMSwxLjAxNTg5OTcsMS4wMTU5MDA2LDEuMDE1ODk5N2gyMi4zNDkxOTc0YzAuNTYxNTAwNSwwLDEuMDE1ODk5Ny0wLjQ1NDI5OTksMS4wMTU4OTk3LTEuMDE1ODk5NyBDMzkuNjE5MDQ5MSwxMy42NjA2OTk4LDM5LjE2NDY1LDEzLjIwNjM5OTksMzguNjAzMTQ5NCwxMy4yMDYzOTk5eiI+PC9wYXRoPiA8cGF0aCBkPSJNMzguNjAzMTQ5NCwyMS4zMzM0MDA3SDE2LjI1Mzk1MmMtMC41NjE1MDA1LDAtMS4wMTU5MDA2LDAuNDU0Mjk5OS0xLjAxNTkwMDYsMS4wMTU3OTg2IGMwLDAuNTYxNTAwNSwwLjQ1NDQwMDEsMS4wMTU5MDE2LDEuMDE1OTAwNiwxLjAxNTkwMTZoMjIuMzQ5MTk3NGMwLjU2MTUwMDUsMCwxLjAxNTg5OTctMC40NTQ0MDEsMS4wMTU4OTk3LTEuMDE1OTAxNiBDMzkuNjE5MDQ5MSwyMS43ODc3MDA3LDM5LjE2NDY1LDIxLjMzMzQwMDcsMzguNjAzMTQ5NCwyMS4zMzM0MDA3eiI+PC9wYXRoPiA8cGF0aCBkPSJNMzguNjAzMTQ5NCwyOS40NjAzMDA0SDE2LjI1Mzk1MmMtMC41NjE1MDA1LDAtMS4wMTU5MDA2LDAuNDU0Mzk5MS0xLjAxNTkwMDYsMS4wMTU4OTk3IHMwLjQ1NDQwMDEsMS4wMTU4OTk3LDEuMDE1OTAwNiwxLjAxNTg5OTdoMjIuMzQ5MTk3NGMwLjU2MTUwMDUsMCwxLjAxNTg5OTctMC40NTQzOTkxLDEuMDE1ODk5Ny0xLjAxNTg5OTcgUzM5LjE2NDY1LDI5LjQ2MDMwMDQsMzguNjAzMTQ5NCwyOS40NjAzMDA0eiI+PC9wYXRoPiA8cGF0aCBkPSJNMjguNDQ0NDQ4NSwzNy41ODcyOTkzSDE2LjI1Mzk1MmMtMC41NjE1MDA1LDAtMS4wMTU5MDA2LDAuNDU0Mzk5MS0xLjAxNTkwMDYsMS4wMTU4OTk3IHMwLjQ1NDQwMDEsMS4wMTU4OTk3LDEuMDE1OTAwNiwxLjAxNTg5OTdoMTIuMTkwNDk2NGMwLjU2MTUwMjUsMCwxLjAxNTgwMDUtMC40NTQzOTkxLDEuMDE1ODAwNS0xLjAxNTg5OTcgUzI5LjAwNTk1MDksMzcuNTg3Mjk5MywyOC40NDQ0NDg1LDM3LjU4NzI5OTN6Ij48L3BhdGg+IDwvZz4gPC9nPjwvc3ZnPg==";
  const base64LinkIcon =
    "data:image/svg+xml;base64,PHN2ZyBpZD0nRXh0ZXJuYWxfTGlua18xNicgd2lkdGg9JzE2JyBoZWlnaHQ9JzE2JyB2aWV3Qm94PScwIDAgMTYgMTYnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPjxyZWN0IHdpZHRoPScxNicgaGVpZ2h0PScxNicgc3Ryb2tlPSdub25lJyBmaWxsPScjMDAwMDAwJyBvcGFjaXR5PScwJy8+DQoNCg0KPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC42NyAwIDAgMC42NyA4IDgpIiA+DQo8cGF0aCBzdHlsZT0ic3Ryb2tlOiBub25lOyBzdHJva2Utd2lkdGg6IDE7IHN0cm9rZS1kYXNoYXJyYXk6IG5vbmU7IHN0cm9rZS1saW5lY2FwOiBidXR0OyBzdHJva2UtZGFzaG9mZnNldDogMDsgc3Ryb2tlLWxpbmVqb2luOiBtaXRlcjsgc3Ryb2tlLW1pdGVybGltaXQ6IDQ7IGZpbGw6IHJnYigwLDAsMCk7IGZpbGwtcnVsZTogbm9uemVybzsgb3BhY2l0eTogMTsiIHRyYW5zZm9ybT0iIHRyYW5zbGF0ZSgtMTIsIC0xMikiIGQ9Ik0gNSAzIEMgMy45MDY5MzcyIDMgMyAzLjkwNjkzNzIgMyA1IEwgMyAxOSBDIDMgMjAuMDkzMDYzIDMuOTA2OTM3MiAyMSA1IDIxIEwgMTkgMjEgQyAyMC4wOTMwNjMgMjEgMjEgMjAuMDkzMDYzIDIxIDE5IEwgMjEgMTIgTCAxOSAxMiBMIDE5IDE5IEwgNSAxOSBMIDUgNSBMIDEyIDUgTCAxMiAzIEwgNSAzIHogTSAxNCAzIEwgMTQgNSBMIDE3LjU4NTkzOCA1IEwgOC4yOTI5Njg4IDE0LjI5Mjk2OSBMIDkuNzA3MDMxMiAxNS43MDcwMzEgTCAxOSA2LjQxNDA2MjUgTCAxOSAxMCBMIDIxIDEwIEwgMjEgMyBMIDE0IDMgeiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPg0KPC9nPg0KPC9zdmc+";
  const themeSelector = document.getElementById("theme-selector");
  const body = document.body;

  // Handle theme changes
  themeSelector.addEventListener("change", function () {
    const selectedTheme = themeSelector.value;
    body.className = `${selectedTheme}-theme`;
  });

  // Initialize with current VS Code theme
  body.classList.add(`${body.dataset.theme}-theme`);

  function sendMessageToSidebarProvider(type, value) {
    vscode.postMessage({ type, value });
  }

  fetch(jsonUri)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new Error("Data is not in expected array format.");
      }

      searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        const results = search(data, query);
        displayResults(results);
      });
    })
    .catch((error) => console.error("Error fetching JSON data:", error));

  function search(data, query) {
    if (!query) return [];

    const results = [];

    data.forEach((item) => {
      const headingMatch = item.heading.toLowerCase().includes(query);
      const classMatches = item.data.filter((c) =>
        c.class.toLowerCase().includes(query)
      );

      if (headingMatch || classMatches.length > 0) {
        results.push({
          heading: item.heading,
          fullLink: item.fullLink,
          classes: classMatches.length > 0 ? classMatches : item.data,
        });
      }
    });

    return results;
  }

  function displayResults(results) {
    resultList.innerHTML = "";

    if (results.length === 0 && searchInput.value.trim() !== "") {
      resultList.innerHTML = "<li>No results found</li>";
    } else if (results.length > 0) {
      results.forEach((result) => {
        const resultDiv = document.createElement("div");

        const headingText = document.createElement("span");
        headingText.textContent = result.heading;
        headingText.style.fontWeight = "bold";
        headingText.style.fontSize = "1.2em";
        resultDiv.appendChild(headingText);

        const ul = document.createElement("ul");

        result.classes.forEach((c) => {
          const subLi = document.createElement("li");

          const classPropertySpan = document.createElement("span");

          const classPropertyText = document.createElement("span");
          classPropertyText.textContent = `${c.class}: ${c.property}`;
          classPropertySpan.appendChild(classPropertyText);

          const iconContainer = document.createElement("span");
          iconContainer.style.marginLeft = "5px";

          const copyIcon = document.createElement("img");
          copyIcon.src = base64CopyIcon;
          copyIcon.alt = "Copy";
          copyIcon.style.width = "16px";
          copyIcon.style.height = "16px";
          copyIcon.style.cursor = "pointer";
          copyIcon.style.marginRight = "5px";

          copyIcon.addEventListener("click", () => {
            event.stopPropagation();
            navigator.clipboard.writeText(`${c.class}`).then(() => {
              console.log(`Copied: ${c.class}`);
            });

            sendMessageToSidebarProvider("classCopied", `${c.class}`);
          });
          iconContainer.appendChild(copyIcon);

          const linkIcon = document.createElement("img");
          linkIcon.src = base64LinkIcon;
          linkIcon.alt = "Link";
          linkIcon.style.width = "16px";
          linkIcon.style.height = "16px";
          linkIcon.style.cursor = "pointer";

          linkIcon.addEventListener("click", () => {
            sendMessageToSidebarProvider("searchQuery", {
              link: result.fullLink,
              heading: result.heading,
            });
          });

          iconContainer.appendChild(linkIcon);
          classPropertySpan.appendChild(iconContainer);
          subLi.appendChild(classPropertySpan);

          ul.appendChild(subLi);
        });

        resultDiv.appendChild(ul);
        resultList.appendChild(resultDiv);
      });
    }
  }
});
