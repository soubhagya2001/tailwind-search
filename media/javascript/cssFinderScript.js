document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const resultList = document.getElementById("resultList");
  const quickNav = document.getElementById("quickNav");
  const quickNavDetails = document.getElementById("quickNavDetails");
  const recentSection = document.getElementById("recentSection");
  const recentItemsList = document.getElementById("recentItems");
  const clearSearch = document.getElementById("clearSearch");
  const clearRecent = document.getElementById("clearRecent");
  const vscode = acquireVsCodeApi();

  const copyIconSvg = `<svg viewBox="0 0 24 24"><path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"/></svg>`;
  const insertIconSvg = `<svg viewBox="0 0 24 24"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg>`;
  const linkIconSvg = `<svg viewBox="0 0 24 24"><path d="M18 19H6C5.45 19 5 18.55 5 18V6C5 5.45 5.45 5 6 5H11V3H6C4.34 3 3 4.34 3 6V18C3 19.66 4.34 21 6 21H18C19.66 21 21 19.66 21 18V13H19V18C19 18.55 18.55 19 18 19ZM14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z"/></svg>`;

  let tailwindData = [];
  let recentItems = JSON.parse(localStorage.getItem("recentTailwind") || "[]");

  function sendMessageToSidebarProvider(type, value) {
    vscode.postMessage({ type, value });
  }

  // Handle messages from the extension host
  window.addEventListener('message', event => {
    const message = event.data;
    if (message.type === 'closeDropdown') {
      quickNavDetails.removeAttribute("open");
    }
  });

  // Handle clear search
  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    clearSearch.style.display = "none";
    performSearch();
    searchInput.focus();
  });

  // Handle clear recent
  if (clearRecent) {
    clearRecent.addEventListener("click", () => {
      recentItems = [];
      localStorage.removeItem("recentTailwind");
      renderRecent();
    });
  }

  // CLOSE DROPDOWN ON CLICK OUTSIDE OR WINDOW FOCUS
  document.addEventListener("click", (event) => {
    if (!quickNavDetails.contains(event.target)) {
        quickNavDetails.removeAttribute("open");
    }
  });

  window.addEventListener("focus", () => {
    quickNavDetails.removeAttribute("open");
  });

  function updateRecent(item) {
    recentItems = [item, ...recentItems.filter(i => i.class !== item.class)].slice(0, 5);
    localStorage.setItem("recentTailwind", JSON.stringify(recentItems));
    renderRecent();
  }

  function renderRecent() {
    if (recentItems.length === 0) {
      recentSection.style.display = "none";
      return;
    }
    recentSection.style.display = "block";
    recentItemsList.innerHTML = "";
    recentItems.forEach(item => {
      const chip = document.createElement("div");
      chip.className = "recent-chip";
      chip.textContent = item.class;
      chip.onclick = () => sendMessageToSidebarProvider("insertClass", item.class);
      recentItemsList.appendChild(chip);
    });
  }

  renderRecent();

  function getColor(propertyValue) {
    if (!propertyValue) return null;
    const hex = propertyValue.match(/#[0-9a-fA-F]{3,6}/);
    if (hex) return hex[0];
    const rgb = propertyValue.match(/rgb\([^)]+\)/);
    if (rgb) return rgb[0];
    const rgba = propertyValue.match(/rgba\([^)]+\)/);
    if (rgba) return rgba[0];
    return null;
  }

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -75% 0px",
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        highlightNavItem(entry.target.dataset.index);
      }
    });
  }, observerOptions);

  function highlightNavItem(index) {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    const activeItem = document.querySelector(`.nav-item[data-index="${index}"]`);
    if (activeItem) {
      activeItem.classList.add("active");
    }
  }

  function fuzzyMatch(text, query) {
    text = text.toLowerCase();
    query = query.toLowerCase();
    if (text.includes(query)) return 100;
    let i = 0, j = 0, score = 0;
    while (i < text.length && j < query.length) {
      if (text[i] === query[j]) { j++; score += 10; }
      i++;
    }
    return j === query.length ? score : 0;
  }

  fetch(jsonUri)
    .then((response) => response.json())
    .then((data) => {
      tailwindData = data;
      searchInput.addEventListener("input", performSearch);
    })
    .catch((error) => console.error("Error fetching JSON data:", error));

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    // Toggle clear button
    clearSearch.style.display = query.length > 0 ? "flex" : "none";

    if (!query) {
      resultList.innerHTML = "";
      quickNav.innerHTML = "";
      quickNavDetails.style.display = "none";
      recentSection.style.display = recentItems.length > 0 ? "block" : "none";
      return;
    }
    recentSection.style.display = "none";
    const results = search(tailwindData, query);
    displayResults(results);
    renderQuickNav(results);
  }

  function renderQuickNav(results) {
    quickNav.innerHTML = "";
    if (results.length <= 1) {
      quickNavDetails.style.display = "none";
      return;
    }
    quickNavDetails.style.display = "block";

    results.forEach((result, index) => {
      const navItem = document.createElement("div");
      navItem.className = "nav-item";
      navItem.textContent = result.heading;
      navItem.dataset.index = index;
      navItem.onclick = (e) => {
        e.stopPropagation();
        const target = document.getElementById(`group-${index}`);
        if (target) {
          const headerHeight = document.querySelector(".header-container").offsetHeight;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 10;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          quickNavDetails.removeAttribute("open");
        }
      };
      quickNav.appendChild(navItem);
    });
  }

  function search(data, query) {
    const results = [];
    data.forEach((item) => {
      const headingScore = fuzzyMatch(item.heading, query);
      const classMatches = item.data
        .map(c => ({ ...c, score: Math.max(fuzzyMatch(c.class, query), fuzzyMatch(c.property || "", query)) }))
        .filter(c => c.score > 15);

      if (headingScore > 40 || classMatches.length > 0) {
        results.push({
          heading: item.heading,
          fullLink: item.fullLink,
          classes: classMatches.sort((a, b) => b.score - a.score).slice(0, 20),
          score: headingScore + (classMatches.length > 0 ? Math.max(...classMatches.map(c => c.score)) : 0)
        });
      }
    });
    return results.sort((a, b) => b.score - a.score).slice(0, 35);
  }

  function displayResults(results) {
    resultList.innerHTML = "";
    if (results.length === 0) {
      resultList.innerHTML = `<div class="no-results">No classes found...</div>`;
      return;
    }

    results.forEach((result, index) => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "result-group";
      groupDiv.id = `group-${index}`;
      groupDiv.dataset.index = index;

      const headingContainer = document.createElement("div");
      headingContainer.className = "heading-container";
      
      const titleWrapper = document.createElement("div");
      titleWrapper.style.display = "flex";
      titleWrapper.style.alignItems = "center";
      titleWrapper.style.gap = "6px";
      titleWrapper.style.flex = "1";

      const toggleIcon = document.createElement("span");
      toggleIcon.className = "toggle-icon";
      toggleIcon.textContent = "▼";
      titleWrapper.appendChild(toggleIcon);

      const headingText = document.createElement("span");
      headingText.className = "heading-text";
      headingText.textContent = result.heading;
      titleWrapper.appendChild(headingText);

      headingContainer.appendChild(titleWrapper);

      // ADD OFFICIAL DOC LINK
      const docBtn = document.createElement("button");
      docBtn.className = "icon-btn";
      docBtn.title = "Official Docs";
      docBtn.innerHTML = linkIconSvg;
      docBtn.onclick = (e) => {
        e.stopPropagation();
        sendMessageToSidebarProvider("searchQuery", { link: result.fullLink, heading: result.heading });
      };
      headingContainer.appendChild(docBtn);

      headingContainer.onclick = () => {
        groupDiv.classList.toggle("collapsed");
      };
      
      groupDiv.appendChild(headingContainer);

      const classList = document.createElement("div");
      classList.className = "class-list";

      result.classes.forEach((c) => {
        const classItem = document.createElement("div");
        classItem.className = "class-item";

        const mainContent = document.createElement("div");
        mainContent.className = "class-info";

        const classHeader = document.createElement("div");
        classHeader.className = "class-header";

        const color = getColor(c.property);
        if (color) {
          const swatch = document.createElement("div");
          swatch.className = "color-swatch";
          swatch.style.backgroundColor = color;
          classHeader.appendChild(swatch);
        }

        const className = document.createElement("span");
        className.className = "class-name";
        className.textContent = c.class;
        classHeader.appendChild(className);
        mainContent.appendChild(classHeader);

        const propertyDesc = document.createElement("span");
        propertyDesc.className = "property-desc";
        propertyDesc.textContent = c.property;
        mainContent.appendChild(propertyDesc);

        classItem.appendChild(mainContent);

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "icon-actions";

        const insertBtn = document.createElement("button");
        insertBtn.className = "icon-btn";
        insertBtn.title = "Insert Class";
        insertBtn.innerHTML = insertIconSvg;
        insertBtn.onclick = (e) => {
          e.stopPropagation();
          sendMessageToSidebarProvider("insertClass", c.class);
          updateRecent(c);
        };
        actionsDiv.appendChild(insertBtn);

        const copyBtn = document.createElement("button");
        copyBtn.className = "icon-btn";
        copyBtn.title = "Copy Class";
        copyBtn.innerHTML = copyIconSvg;
        copyBtn.onclick = (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(c.class).then(() => {
            sendMessageToSidebarProvider("classCopied", c.class);
            updateRecent(c);
          });
        };
        actionsDiv.appendChild(copyBtn);

        classItem.appendChild(actionsDiv);
        classList.appendChild(classItem);
      });

      groupDiv.appendChild(classList);
      resultList.appendChild(groupDiv);
      observer.observe(groupDiv);
    });
  }
});
