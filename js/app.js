const tabsContainer = document.querySelector("#filterTabs");
const menuGrid = document.querySelector("#menuGrid");
const searchInput = document.querySelector("#menuSearch");
const languageButtons = document.querySelectorAll("[data-language]");

const translations = {
  en: {
    brandName: "Damu Hotel",
    logoFallback: "DH",
    navMenu: "Menu",
    navAbout: "About",
    navContact: "Contact",
    heroEyebrow: "Hotel and Restaurant",
    heroTagline: "Fresh meals, warm hospitality.",
    heroCta: "View Menu",
    menuEyebrow: "Our Menu",
    menuTitle: "Choose a filter",
    menuIntro: "Browse Ethiopian-style examples now, then update the menu data file with real items and prices.",
    searchLabel: "Search menu",
    searchPlaceholder: "Search shiro, tibs, ሽሮ...",
    popular: "Popular",
    noResults: "No menu items found. Try another search or filter.",
    aboutEyebrow: "About Damu Hotel",
    aboutTitle: "Simple, welcoming, and made for everyday dining.",
    aboutCopy: "Damu Hotel offers delicious meals, refreshing drinks, and welcoming hospitality for guests and local customers.",
    footerLocation: "Location",
    footerLocationValue: "Damu Hotel, Your City, Ethiopia",
    footerPhone: "Phone",
    footerHours: "Opening Hours",
    footerHoursValue: "Mon-Sun: 7:00 AM - 10:00 PM",
    footerSocial: "Social",
    socialFacebook: "Facebook",
    socialInstagram: "Instagram",
    socialTikTok: "TikTok",
  },
  am: {
    brandName: "ዳሙ ሆቴል",
    logoFallback: "ዳሙ",
    navMenu: "የምግብ ዝርዝር",
    navAbout: "ስለ እኛ",
    navContact: "አድራሻ",
    heroEyebrow: "ሆቴል እና ሬስቶራንት",
    heroTagline: "ትኩስ ምግቦች፣ ሞቅ ያለ እንግዳ አቀባበል።",
    heroCta: " የምግብ ዝርዝር ይመልከቱ",
    menuEyebrow: "የእኛ የምግብ ዝርዝር",
    menuTitle: "የ ምግብ ዝርዝር",
    menuIntro: "የኢትዮጵያ ምግቦችን ይመልከቱ",
    searchLabel: "አይነት ይፈልጉ",
    searchPlaceholder: "ሽሮ፣ tibs፣ shiro ይፈልጉ...",
    popular: "ተወዳጅ",
    noResults: "የ ምግብ ዝርዝር ውስጥ የለም ሌላ ይሞክሩ።",
    aboutEyebrow: "ስለ ዳሙ ሆቴል",
    aboutTitle: "ቀላል፣ ምቹ እና በፍቅር የተዘጋጀ ምግብ።።",
    aboutCopy: "ዳሙ ሆቴል ለእንግዶች እና ለአካባቢ ደንበኞች ጣፋጭ ምግቦች፣ አዳዲስ መጠጦች እና ሞቅ ያለ እንግዳ አቀባበል ያቀርባል።",
    footerLocation: "አድራሻ",
    footerLocationValue: "ዳሙ ሆቴል፣ ከተማዎ፣ ኢትዮጵያ",
    footerPhone: "ስልክ",
    footerHours: "የስራ ሰዓት",
    footerHoursValue: "ሰኞ-እሁድ፦ 7:00 ጠዋት - 10:00 ማታ",
    footerSocial: "ማህበራዊ ገጾች",
    socialFacebook: "ፌስቡክ",
    socialInstagram: "ኢንስታግራም",
    socialTikTok: "ቲክቶክ",
  },
};

let activeFilter = "all";
let currentLanguage = localStorage.getItem("damuLanguage") || "en";

function translate(key) {
  return translations[currentLanguage][key] || translations.en[key] || key;
}

function itemText(item, field) {
  const key = currentLanguage === "am" ? `amharic${field}` : `english${field}`;
  return item[key];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return entities[character];
  });
}

function createBadges(item) {
  if (item.drinkType) {
    return `<span class="badge category-badge">${categoryLabels[item.category][currentLanguage]}</span>`;
  }

  const badges = [
    `<span class="badge category-badge">${categoryLabels[item.category][currentLanguage]}</span>`,
    `<span class="badge diet-badge">${item.fasting ? dietLabels.fasting[currentLanguage] : dietLabels.nonFasting[currentLanguage]}</span>`,
  ];

  if (item.popular) {
    badges.push(`<span class="badge popular-badge">${translate("popular")}</span>`);
  }

  return badges.join("");
}

function createImagePlaceholder(item) {
  const initials = item.englishName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return `
    <div class="item-image" aria-hidden="true">
      <span>${initials}</span>
    </div>
  `;
}

function createMenuCard(item) {
  const name = escapeHtml(itemText(item, "Name"));
  const description = escapeHtml(itemText(item, "Description"));
  const price = escapeHtml(item.price);
  const descriptionMarkup = description ? `<p>${description}</p>` : "";

  return `
    <article class="menu-card">
      ${createImagePlaceholder(item)}
      <div class="menu-card-body">
        <div class="card-title-row">
          <h3>${name}</h3>
          <strong>${price}</strong>
        </div>
        ${descriptionMarkup}
        <div class="card-badges">${createBadges(item)}</div>
      </div>
    </article>
  `;
}

function renderTabs() {
  tabsContainer.innerHTML = menuFilters
    .map((filter) => `
        <button
          class="category-tab ${filter.id === activeFilter ? "is-active" : ""}"
          type="button"
          data-filter="${filter.id}"
        >
          ${filter.label[currentLanguage]}
        </button>
      `)
    .join("");
}

function matchesFilter(item) {
  if (["breakfast", "lunch"].includes(activeFilter)) return item.category === activeFilter;
  if (activeFilter === "fasting") return item.fasting;
  if (activeFilter === "nonFasting") return !item.fasting && !item.drinkType;
  if (activeFilter === "drinks") return item.category === "drinks";
  if (activeFilter === "hotDrinks") return item.category === "hotDrinks";
  return true;
}

function matchesSearch(item) {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return true;

  const searchableText = [
    item.englishName,
    item.amharicName,
    item.englishDescription,
    item.amharicDescription,
    categoryLabels[item.category].en,
    categoryLabels[item.category].am,
    item.drinkType ? drinkTypeLabels[item.drinkType].en : "",
    item.drinkType ? drinkTypeLabels[item.drinkType].am : "",
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

function getVisibleItems() {
  return menuItems.filter((item) => matchesFilter(item) && matchesSearch(item));
}

function renderMenuItems() {
  const visibleItems = getVisibleItems();

  if (!visibleItems.length) {
    menuGrid.innerHTML = `<p class="empty-state">${translate("noResults")}</p>`;
    return;
  }

  menuGrid.innerHTML = visibleItems.map(createMenuCard).join("");
}

function renderTranslations() {
  document.documentElement.lang = currentLanguage === "am" ? "am" : "en";
  document.body.classList.toggle("lang-am", currentLanguage === "am");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = translate(element.dataset.i18nPlaceholder);
  });

  languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.language === currentLanguage);
  });

  document.querySelectorAll("[data-logo-fallback]").forEach((element) => {
    element.textContent = translate("logoFallback");
  });
}

function renderPage() {
  renderTranslations();
  renderTabs();
  renderMenuItems();
}

tabsContainer.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-filter]");
  if (!tab) return;

  activeFilter = tab.dataset.filter;
  renderPage();
});

searchInput.addEventListener("input", renderMenuItems);

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.language;
    localStorage.setItem("damuLanguage", currentLanguage);
    renderPage();
  });
});

renderPage();
