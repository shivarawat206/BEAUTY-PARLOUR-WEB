/* Glow & Grace – Stage 1 & 2 */
(function () {
  "use strict";

  const header = document.getElementById("ggHeader");

  /* 1. Sticky header: ivory + shadow after scrolling */
  const onScroll = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* 2. Desktop side panel must close if screen shrinks to mobile */
  const infoPanelEl = document.getElementById("infoPanel");
  window.addEventListener("resize", () => {
    if (window.innerWidth < 992) {
      const inst = bootstrap.Offcanvas.getInstance(infoPanelEl);
      if (inst) inst.hide();
    } else {
      const m = bootstrap.Offcanvas.getInstance(
        document.getElementById("mobileMenu"),
      );
      if (m) m.hide();
    }
  });

  /* 3. Active link highlight on scroll (works once sections exist) */
  const links = document.querySelectorAll('#ggMenu .gg-link[href^="#"]');
  const sections = [...links]
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const spy = () => {
    const y = window.scrollY + 140;
    let current = null;
    sections.forEach((s) => {
      if (s.offsetTop <= y) current = s.id;
    });
    links.forEach((a) =>
      a.classList.toggle(
        "active",
        current && a.getAttribute("href") === "#" + current,
      ),
    );
  };
  window.addEventListener("scroll", spy, { passive: true });
  spy();

  /* 4. Mobile: after menu closes, scroll to the tapped anchor smoothly */
  document.querySelectorAll('#mobileMenu a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const el = document.getElementById("mobileMenu");
      el.addEventListener(
        "hidden.bs.offcanvas",
        () => {
          target.scrollIntoView({ behavior: "smooth" });
        },
        { once: true },
      );
    });
  });
})();
/* Glow & Grace – Hero + Trust strip behaviour */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero =
    document.getElementById("ggHero") || document.querySelector(".gg-hero");

  /* 1. Falling rose petals (subtle) */
  const petals = document.getElementById("ggPetals");
  if (petals && !reduce) {
    const count = window.innerWidth < 576 ? 8 : 16;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "gg-petal";
      const size = 9 + Math.random() * 14;
      p.style.setProperty("--l", Math.random() * 100 + "%");
      p.style.setProperty("--s", size + "px");
      p.style.setProperty("--t", 16 + Math.random() * 14 + "s");
      p.style.setProperty("--dl", -Math.random() * 28 + "s");
      p.style.setProperty("--dx", (Math.random() - 0.5) * 220 + "px");
      p.style.setProperty(
        "--r",
        (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360) + "deg",
      );
      petals.appendChild(p);
    }
  }

  /* 2. Orbit icons: activate one by one (hover / focus / tap takes over) */
  const orbs = [...document.querySelectorAll(".gg-orb")];
  const pics = [...document.querySelectorAll(".gg-pimg")]; // same order as orbs
  if (orbs.length) {
    let current = -1,
      timer = null;
    const activate = (n) => {
      current = n;
      orbs.forEach((o, k) => o.classList.toggle("is-active", k === n));
      pics.forEach((im, k) => im.classList.toggle("is-active", k === n));
    };
    const stop = () => {
      clearInterval(timer);
      timer = null;
    };
    const start = () => {
      stop();
      if (reduce) return;
      timer = setInterval(() => activate((current + 1) % orbs.length), 2600);
    };

    setTimeout(() => {
      activate(0);
      start();
    }, 1900);

    orbs.forEach((o, k) => {
      o.addEventListener("mouseenter", () => {
        stop();
        activate(k);
      });
      o.addEventListener("mouseleave", start);
      o.addEventListener("focus", () => {
        stop();
        activate(k);
      });
      o.addEventListener("blur", start);
      o.addEventListener("click", () => {
        stop();
        activate(k);
        setTimeout(start, 4000);
      });
    });
    document.addEventListener("visibilitychange", () =>
      document.hidden ? stop() : start(),
    );
  }

  /* 3. Very light mouse parallax */
  const layers = hero ? [...hero.querySelectorAll(".gg-px")] : [];
  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  if (layers.length && canHover && !reduce) {
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0,
      raf = null;
    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.forEach((el) => {
        const d = parseFloat(el.dataset.depth) || 10;
        el.style.transform =
          "translate3d(" +
          (-cx * d).toFixed(2) +
          "px," +
          (-cy * d).toFixed(2) +
          "px,0)";
      });
      raf =
        Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001
          ? requestAnimationFrame(tick)
          : null;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      kick();
    });
    hero.addEventListener("mouseleave", () => {
      tx = ty = 0;
      kick();
    });
  }

  /* 4. Scroll reveal for strip + following sections */
  const items = document.querySelectorAll(".gg-reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            obs.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-in"));
  }
})();

//=================================ABOUT JS=========================//
const io = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("on");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.15 },
);
document.querySelectorAll(".rv").forEach((el) => io.observe(el));

//=============================SERVICES ECTION JS===================//
const track = document.getElementById("track"),
  dots = document.getElementById("dots"),
  tabs = document.querySelectorAll(".tab"),
  cards = [...track.children];
let vis = cards;

function buildDots() {
  dots.innerHTML = "";
  vis.forEach((c, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Go to card " + (i + 1));
    b.onclick = () => center(c);
    dots.appendChild(b);
  });
}
function center(c) {
  track.scrollTo({
    left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2,
    behavior: "smooth",
  });
}
function update() {
  const mid = track.scrollLeft + track.clientWidth / 2;
  let best = 0,
    d = 1e9;
  vis.forEach((c, i) => {
    const x = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
    if (x < d) {
      d = x;
      best = i;
    }
  });
  vis.forEach((c, i) => c.classList.toggle("active", i === best));
  [...dots.children].forEach((b, i) => b.classList.toggle("on", i === best));
}
let raf;
track.addEventListener("scroll", () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(update);
});
addEventListener("resize", update);

tabs.forEach(
  (t) =>
    (t.onclick = () => {
      tabs.forEach((x) => x.classList.toggle("on", x === t));
      const f = t.dataset.f;
      cards.forEach((c) =>
        c.classList.toggle("hide", f !== "all" && c.dataset.c !== f),
      );
      vis = cards.filter((c) => !c.classList.contains("hide"));
      track.scrollLeft = 0;
      buildDots();
      update();
    }),
);
document.querySelector(".nav.prev").onclick = () =>
  track.scrollBy({ left: -(cards[0].offsetWidth + 22), behavior: "smooth" });
document.querySelector(".nav.next").onclick = () =>
  track.scrollBy({ left: cards[0].offsetWidth + 22, behavior: "smooth" });

buildDots();
update();

document.querySelectorAll(".rv").forEach((el) => io.observe(el));

//=======================PACKAGE SECTION JS=========================//
const ggTrack = document.querySelector(".carousel__track");
const ggCards = [...ggTrack.querySelectorAll(".package-card")];
const ggDots = [...document.querySelectorAll(".carousel__dot")];
const ggModal = document.querySelector(".package-modal");
const ggModalEl = {
  image: ggModal.querySelector(".package-modal__image img"),
  title: ggModal.querySelector(".package-modal__title"),
  tagline: ggModal.querySelector(".package-modal__tagline"),
  desc: ggModal.querySelector(".package-modal__desc"),
  list: ggModal.querySelector(".package-modal__list"),
  price: ggModal.querySelector(".price"),
};
const GG_CARD_GAP = 26;
let ggSelectedCard = null;

/* ---------- Carousel ---------- */
function ggCenterCard(card) {
  const left = card.offsetLeft - (ggTrack.clientWidth - card.offsetWidth) / 2;
  ggTrack.scrollTo({ left, behavior: "smooth" });
}

function ggScrollCarousel(direction) {
  const step = ggCards[0].offsetWidth + GG_CARD_GAP;
  ggTrack.scrollBy({ left: direction * step, behavior: "smooth" });
}

function ggUpdateActiveDot() {
  const trackCenter = ggTrack.scrollLeft + ggTrack.clientWidth / 2;
  let activeIndex = 0;
  let minDistance = Infinity;

  ggCards.forEach((card, index) => {
    const distance = Math.abs(
      card.offsetLeft + card.offsetWidth / 2 - trackCenter,
    );
    if (distance < minDistance) {
      minDistance = distance;
      activeIndex = index;
    }
  });

  ggDots.forEach((dot, index) =>
    dot.classList.toggle("is-active", index === activeIndex),
  );
}

/* ---------- Modal ---------- */
function ggOpenModal(card) {
  ggSelectedCard = card;
  const items = [...card.querySelectorAll(".package-card__list li")].map((li) =>
    li.textContent.trim(),
  );
  const duration = card
    .querySelector(".package-card__duration")
    .textContent.trim();
  const cardImage = card.querySelector(".package-card__photo img");

  ggModalEl.image.classList.remove("is-broken");
  ggModalEl.image.src = cardImage.src;
  ggModalEl.image.alt = cardImage.alt;
  ggModalEl.title.textContent = card.querySelector(
    ".package-card__title",
  ).textContent;
  ggModalEl.tagline.innerHTML = card.querySelector(
    ".package-card__tagline",
  ).innerHTML;
  ggModalEl.desc.textContent = `${card.querySelector(".package-card__desc").textContent} Duration: ${duration}.`;
  ggModalEl.price.innerHTML = card.querySelector(".price").innerHTML;

  ggModalEl.list.replaceChildren(
    ...items.map((text) => {
      const li = document.createElement("li");
      li.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>';
      li.append(text);
      return li;
    }),
  );

  ggModal.showModal();
}

function ggCloseModal() {
  ggModal.close();
}

/* ---------- Booking ----------
   The appointment form can either contain <select id="apptPackage">
   (option value = package id) or listen to the 'package:selected' event. */
function ggBookPackage() {
  if (!ggSelectedCard) return;

  const detail = {
    id: ggSelectedCard.dataset.packageId,
    name: ggSelectedCard.querySelector(".package-card__title").textContent,
    price: ggSelectedCard.querySelector(".price__value").textContent,
  };

  try {
    sessionStorage.setItem(
      "selectedPackage",
      JSON.stringify({ id: detail.id, name: detail.name }),
    );
  } catch (e) {}

  const select = document.getElementById("apptPackage");
  if (select) {
    select.value = detail.id;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  document.dispatchEvent(new CustomEvent("package:selected", { detail }));
  ggCloseModal();
  location.hash = "book";
}

/* ---------- Scroll reveal ---------- */
function ggInitReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ---------- Missing images ---------- */
function ggHideBrokenImages() {
  document.addEventListener(
    "error",
    (event) => {
      if (event.target.tagName === "IMG")
        event.target.classList.add("is-broken");
    },
    true,
  );

  document.querySelectorAll("img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) img.classList.add("is-broken");
  });
}

/* ---------- Events ---------- */
ggDots.forEach((dot, index) =>
  dot.addEventListener("click", () => ggCenterCard(ggCards[index])),
);
document
  .querySelector(".carousel__btn--prev")
  .addEventListener("click", () => ggScrollCarousel(-1));
document
  .querySelector(".carousel__btn--next")
  .addEventListener("click", () => ggScrollCarousel(1));

let ggScrollFrame;
ggTrack.addEventListener("scroll", () => {
  cancelAnimationFrame(ggScrollFrame);
  ggScrollFrame = requestAnimationFrame(ggUpdateActiveDot);
});
window.addEventListener("resize", ggUpdateActiveDot);

ggTrack.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="view-details"]');
  if (button) ggOpenModal(button.closest(".package-card"));
});

ggModal
  .querySelector(".package-modal__close")
  .addEventListener("click", ggCloseModal);
ggModal
  .querySelector('[data-action="book-package"]')
  .addEventListener("click", ggBookPackage);
ggModal.addEventListener("click", (event) => {
  if (event.target === ggModal) ggCloseModal();
});

ggHideBrokenImages();
ggInitReveal();
ggUpdateActiveDot();

//===============================BRIDAL JS==============================//
function bridalInitServicesSlider() {
  return new Swiper(".bridal-slider .swiper", {
    spaceBetween: 14,
    slidesPerView: 1.15, // mobile: card + thoda next card ka peek
    grabCursor: true,
    simulateTouch: true,
    watchOverflow: true,
    navigation: {
      prevEl: ".bridal-services-prev",
      nextEl: ".bridal-services-next",
    },
    breakpoints: {
      480: { slidesPerView: 1.6, spaceBetween: 14 },
      720: { slidesPerView: 2.4, spaceBetween: 16 },
      1000: { slidesPerView: 3, spaceBetween: 16 },
      1180: { slidesPerView: 4, spaceBetween: 16 },
    },
  });
}

/* Call it after DOM ready */
document.addEventListener("DOMContentLoaded", () => {
  bridalInitServicesSlider();
});

function bridalInitPortfolioSlider() {
  return new Swiper(".bridal-portfolio-slider .swiper", {
    spaceBetween: 16,
    slidesPerView: 1.4,
    navigation: {
      prevEl: ".bridal-portfolio-prev",
      nextEl: ".bridal-portfolio-next",
    },
    breakpoints: {
      480: { slidesPerView: 2.2 },
      720: { slidesPerView: 3 },
      1000: { slidesPerView: 4 },
      1200: { slidesPerView: 5 },
    },
  });
}

/* ---------- Before / After ---------- */
function bridalSetComparePosition(compare, value) {
  compare.style.setProperty("--pos", `${value}%`);
}

function bridalInitCompareSliders() {
  document.querySelectorAll(".bridal-compare").forEach((compare) => {
    const range = compare.querySelector(".bridal-compare__range");
    range.addEventListener("input", () =>
      bridalSetComparePosition(compare, range.value),
    );
    bridalSetComparePosition(compare, range.value);
  });
}

/* ---------- Scroll reveal ---------- */
function bridalInitReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  document
    .querySelectorAll(".bridal-reveal")
    .forEach((el) => observer.observe(el));
}

/* ---------- Missing images ---------- */
function bridalHideBrokenImages() {
  document.addEventListener(
    "error",
    (event) => {
      if (event.target.tagName === "IMG")
        event.target.classList.add("is-broken");
    },
    true,
  );

  document.querySelectorAll("img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) img.classList.add("is-broken");
  });
}

bridalHideBrokenImages();
bridalInitServicesSlider();
bridalInitPortfolioSlider();
bridalInitCompareSliders();
bridalInitReveal();

//===============================GALLERY JS=========================//

const grid = document.querySelector(".gallery-grid");
const items = [...grid.querySelectorAll(".gallery-item")];
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const moreButton = document.querySelector(".gallery-more");
const PAGE_SIZE = Number(grid.dataset.pageSize);

let activeFilter = "all";
let visibleCount = PAGE_SIZE;
let lightbox = null;

/* ---------- Filtering & pagination ---------- */
function getMatchingItems() {
  return items.filter(
    (item) => activeFilter === "all" || item.dataset.category === activeFilter,
  );
}

function renderGallery() {
  const matching = getMatchingItems();
  items.forEach((item) => {
    item.hidden = true;
  });
  matching.forEach((item, index) => {
    item.hidden = index >= visibleCount;
  });
  moreButton.hidden = visibleCount >= matching.length;
}

function setActiveCategory(filter) {
  activeFilter = filter;
  visibleCount = PAGE_SIZE;
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    if (isActive && button.classList.contains("gallery-tab")) {
      button.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  });
  renderGallery();
}

function loadMore() {
  visibleCount += PAGE_SIZE;
  renderGallery();
}

function updateCounts() {
  document.querySelectorAll("[data-count]").forEach((badge) => {
    const filter = badge.dataset.count;
    badge.textContent = items.filter(
      (item) => filter === "all" || item.dataset.category === filter,
    ).length;
  });
}

/* ---------- Lightbox (GLightbox) ---------- */
function toSlide(item) {
  const slide = {
    href: item.getAttribute("href"),
    type: item.dataset.type,
    title: item.querySelector(".gallery-item__title").textContent,
    description: item.querySelector(".gallery-item__desc").textContent,
  };
  if (item.dataset.type === "video") slide.source = item.dataset.source;
  return slide;
}

function openLightbox(item) {
  const matching = getMatchingItems();
  const slides = matching.map(toSlide);

  if (lightbox) {
    lightbox.setElements(slides);
  } else {
    lightbox = GLightbox({
      elements: slides,
      loop: true,
      touchNavigation: true,
      openEffect: "zoom",
      closeEffect: "fade",
      slideEffect: "slide",
    });
  }
  lightbox.openAt(matching.indexOf(item));
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ---------- Missing images ---------- */
function hideBrokenImages() {
  document.addEventListener(
    "error",
    (event) => {
      if (event.target.tagName === "IMG")
        event.target.classList.add("is-broken");
    },
    true,
  );

  document.querySelectorAll("img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) img.classList.add("is-broken");
  });
}

/* ---------- Events ---------- */
filterButtons.forEach((button) =>
  button.addEventListener("click", () =>
    setActiveCategory(button.dataset.filter),
  ),
);
moreButton.addEventListener("click", loadMore);
grid.addEventListener("click", (event) => {
  const item = event.target.closest(".gallery-item");
  if (!item) return;
  event.preventDefault();
  openLightbox(item);
});

hideBrokenImages();
updateCounts();
renderGallery();
initReveal();

/* ---------- Testimonials slider ---------- */
function initReviewsSlider() {
  return new Swiper(".reviews-slider .swiper", {
    spaceBetween: 18,
    slidesPerView: 1 /* mobile: one review at a time */,
    grabCursor: true,
    touchRatio: 1,
    simulateTouch: true,
    navigation: { prevEl: ".reviews-prev", nextEl: ".reviews-next" },
    pagination: {
      el: ".reviews-dots",
      clickable: true,
      bulletClass: "reviews-dot",
      bulletActiveClass: "is-active",
    },
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 18 },
      1100: { slidesPerView: 3, spaceBetween: 18 },
    },
  });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ---------- Missing images ---------- */
function hideBrokenImages() {
  document.addEventListener(
    "error",
    (event) => {
      if (event.target.tagName === "IMG")
        event.target.classList.add("is-broken");
    },
    true,
  );

  document.querySelectorAll("img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) img.classList.add("is-broken");
  });
}

hideBrokenImages();
initReviewsSlider();
initReveal();

//=========================INSTAGRAM FEED AND APPOINTMENT BOOKING============================//

/* All content lives in the HTML above. JS only adds behaviour. */
const MAX_MONTHS_AHEAD = 3;

const bookForm = document.querySelector(".book-form");
const dropdowns = [...bookForm.querySelectorAll("[data-dropdown]")];
const serviceInput = bookForm.elements.service;
const dateInput = bookForm.elements.date;
const timeInput = bookForm.elements.time;
const dateField = bookForm.querySelector('[data-dropdown="date"]');
const timeField = bookForm.querySelector('[data-dropdown="time"]');
const calendarDays = dateField.querySelector(".cal-days");
const calendarTitle = dateField.querySelector(".cal-head__title");
const calendarPrev = dateField.querySelector(".cal-prev");
const calendarNext = dateField.querySelector(".cal-next");
const timeSlots = [...bookForm.querySelectorAll(".slot")];
const toastEl = document.getElementById("bookingToast");

let calendarMonth = null;

/* ---------- Instagram slider ---------- */
function initInstagramSlider() {
  return new Swiper(".insta__feed .swiper", {
    spaceBetween: 14,
    slidesPerView: 1.6,
    navigation: { prevEl: ".insta-nav__prev", nextEl: ".insta-nav__next" },
    breakpoints: {
      480: { slidesPerView: 2.4 },
      768: { slidesPerView: 2 },
      992: { slidesPerView: 3 },
      1200: { slidesPerView: 4 },
    },
  });
}

/* ---------- Date helpers ---------- */
function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function toISODate(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatDateLabel(date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ---------- Dropdown behaviour ---------- */
function positionMenu(dropdown) {
  const box = dropdown.querySelector(".book-box");
  const menu = dropdown.querySelector(".book-menu");
  const rect = box.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const needsFlip =
    spaceBelow < menu.offsetHeight + 16 && spaceAbove > spaceBelow;
  dropdown.classList.toggle("book-field--up", needsFlip);
}

function openDropdown(dropdown) {
  closeAllDropdowns(dropdown);
  positionMenu(dropdown);
  dropdown.classList.add("is-open");
  dropdown.querySelector(".book-trigger").setAttribute("aria-expanded", "true");
}

function closeDropdown(dropdown) {
  dropdown.classList.remove("is-open");
  dropdown
    .querySelector(".book-trigger")
    .setAttribute("aria-expanded", "false");
}

function closeAllDropdowns(except) {
  dropdowns.forEach((dropdown) => {
    if (dropdown !== except) closeDropdown(dropdown);
  });
}

function toggleDropdown(dropdown) {
  if (dropdown.classList.contains("is-open")) closeDropdown(dropdown);
  else openDropdown(dropdown);
}

function setFieldError(dropdown, hasError) {
  dropdown.classList.toggle("book-field--error", hasError);
}

function chooseValue(dropdown, value, label) {
  dropdown.querySelector('input[type="hidden"]').value = value;
  dropdown.querySelector(".book-trigger__value").textContent = label;
  dropdown.classList.add("book-field--filled");
  dropdown.querySelectorAll("[data-value]").forEach((item) => {
    item.classList.toggle("is-selected", item.dataset.value === value);
  });
  setFieldError(dropdown, false);
}

function resetDropdown(dropdown) {
  const valueEl = dropdown.querySelector(".book-trigger__value");
  dropdown.querySelector('input[type="hidden"]').value = "";
  valueEl.textContent = valueEl.dataset.placeholder;
  dropdown.classList.remove("book-field--filled", "book-field--error");
  dropdown
    .querySelectorAll(".is-selected")
    .forEach((item) => item.classList.remove("is-selected"));
  closeDropdown(dropdown);
}

function handleChoice(choice) {
  const dropdown = choice.closest("[data-dropdown]");
  chooseValue(
    dropdown,
    choice.dataset.value,
    choice.dataset.label || choice.dataset.value,
  );
  if (dropdown === dateField) updateTimeSlots();
  closeDropdown(dropdown);
}

function handleDropdownKeydown(event) {
  const dropdown = event.target.closest("[data-dropdown]");
  if (!dropdown) return;

  if (event.key === "Escape") {
    closeAllDropdowns();
    dropdown.querySelector(".book-trigger").focus();
    return;
  }
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

  const items = [
    ...dropdown.querySelectorAll(".book-option, .slot:not(:disabled)"),
  ];
  if (!items.length) return;

  event.preventDefault();
  if (!dropdown.classList.contains("is-open")) openDropdown(dropdown);
  const step = event.key === "ArrowDown" ? 1 : -1;
  const next = items.indexOf(document.activeElement) + step;
  items[(next + items.length) % items.length].focus();
}

/* ---------- Calendar ---------- */
function renderCalendar() {
  const today = startOfToday();
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < calendarMonth.getDay(); i++) cells.push("<span></span>");

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const iso = toISODate(date);
    const isClosed = date.getDay() === 0;
    const isPast = date < today;
    const classes = ["cal-day"];

    if (iso === toISODate(today)) classes.push("is-today");
    if (iso === dateInput.value) classes.push("is-selected");
    if (isClosed) classes.push("is-closed");

    cells.push(
      `<button class="${classes.join(" ")}" type="button" data-value="${iso}" data-label="${formatDateLabel(date)}"${isPast || isClosed ? " disabled" : ""}>${day}</button>`,
    );
  }

  calendarDays.innerHTML = cells.join("");
  calendarTitle.textContent = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(
    today.getFullYear(),
    today.getMonth() + MAX_MONTHS_AHEAD,
    1,
  );
  calendarPrev.disabled = calendarMonth <= firstMonth;
  calendarNext.disabled = calendarMonth >= lastMonth;
}

function changeCalendarMonth(step) {
  calendarMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + step,
    1,
  );
  renderCalendar();
}

function resetCalendar() {
  const today = startOfToday();
  calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  renderCalendar();
}

/* ---------- Time slots ---------- */
function updateTimeSlots() {
  const now = new Date();
  const isToday = dateInput.value === toISODate(startOfToday());
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  timeSlots.forEach((slot) => {
    const [hours, minutes] = slot.dataset.time.split(":").map(Number);
    slot.disabled = isToday && hours * 60 + minutes <= nowMinutes + 30;
  });

  const selectedSlot = timeSlots.find(
    (slot) => slot.dataset.value === timeInput.value,
  );
  if (selectedSlot && selectedSlot.disabled) resetDropdown(timeField);
}

/* ---------- Booking submit ---------- */
function validateBooking() {
  const results = [serviceInput, dateInput, timeInput].map((input) => {
    const isValid = input.value !== "";
    setFieldError(input.closest("[data-dropdown]"), !isValid);
    return isValid;
  });
  return results.every(Boolean);
}

function getFieldLabel(input) {
  return input.closest("[data-dropdown]").querySelector(".book-trigger__value")
    .textContent;
}

function buildWhatsappLink() {
  const message = [
    "Hello Glow & Grace, I would like to book an appointment.",
    `Service: ${getFieldLabel(serviceInput)}`,
    `Date: ${getFieldLabel(dateInput)}`,
    `Time: ${timeInput.value}`,
  ].join("\n");

  return `https://wa.me/${bookForm.dataset.whatsapp}?text=${encodeURIComponent(message)}`;
}

function resetBookingForm() {
  dropdowns.forEach(resetDropdown);
  resetCalendar();
  updateTimeSlots();
}

function handleBookingSubmit(event) {
  event.preventDefault();
  if (!validateBooking()) return;

  const whatsappLink = buildWhatsappLink();
  bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 4000 }).show();
  window.open(whatsappLink, "_blank", "noopener");
  resetBookingForm();
}

/* Preselect the service chosen in the packages section (event or sessionStorage) */
function selectPackage(packageId) {
  const option = bookForm.querySelector(
    `.book-option[data-value="${packageId}"]`,
  );
  if (option)
    chooseValue(
      option.closest("[data-dropdown]"),
      option.dataset.value,
      option.dataset.label,
    );
}

function restoreSelectedPackage() {
  try {
    const saved = JSON.parse(sessionStorage.getItem("selectedPackage"));
    if (saved) selectPackage(saved.id);
  } catch (error) {
    /* sessionStorage unavailable: nothing to restore */
  }
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ---------- Missing images: remove them so the gradient placeholder shows ---------- */
function removeBrokenImages() {
  document.addEventListener(
    "error",
    (event) => {
      if (event.target.tagName === "IMG") event.target.remove();
    },
    true,
  );

  document.querySelectorAll("img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) img.remove();
  });
}

/* ---------- Events ---------- */
bookForm.addEventListener("submit", handleBookingSubmit);
bookForm.addEventListener("keydown", handleDropdownKeydown);
bookForm.addEventListener("click", (event) => {
  const trigger = event.target.closest(".book-trigger");
  if (trigger) return toggleDropdown(trigger.closest("[data-dropdown]"));

  if (event.target.closest(".cal-prev")) return changeCalendarMonth(-1);
  if (event.target.closest(".cal-next")) return changeCalendarMonth(1);

  const choice = event.target.closest("[data-value]");
  if (choice && !choice.disabled) handleChoice(choice);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-dropdown]")) closeAllDropdowns();
});
document.addEventListener("package:selected", (event) =>
  selectPackage(event.detail.id),
);

removeBrokenImages();
resetCalendar();
updateTimeSlots();
restoreSelectedPackage();
initInstagramSlider();
initReveal();

//===================================FOOTER ANIMTIONS JS=================================//

/* All content lives in the HTML above. JS only adds behaviour. */
const SHOW_TOP_BUTTON_AFTER = 400;

const hoursBox = document.querySelector(".footer-hours");
const hoursStatus = document.querySelector(".footer-hours__status");
const hoursRows = [...document.querySelectorAll(".footer-hours__row")];
const newsletterForm = document.querySelector(".footer-news__form");
const newsletterInput = newsletterForm.elements.email;
const newsletterFeedback = document.querySelector(".footer-news__feedback");
const topButton = document.querySelector(".footer-top");
const topProgress = document.querySelector(".footer-top__progress");
const yearEl = document.querySelector(".footer-bottom__year");

/* ---------- Current year ---------- */
function setCurrentYear() {
  yearEl.textContent = new Date().getFullYear();
}

/* ---------- Open / closed status + highlight today ---------- */
function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function updateOpenStatus() {
  const now = new Date();
  const today = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openDays = hoursBox.dataset.openDays.split(",").map(Number);
  const isOpen =
    openDays.includes(today) &&
    nowMinutes >= toMinutes(hoursBox.dataset.openTime) &&
    nowMinutes < toMinutes(hoursBox.dataset.closeTime);

  hoursRows.forEach((row) => {
    const rowDays = row.dataset.days.split(",").map(Number);
    row.classList.toggle("is-today", rowDays.includes(today));
  });

  hoursStatus.textContent = isOpen
    ? hoursStatus.dataset.openLabel
    : hoursStatus.dataset.closedLabel;
  hoursStatus.classList.toggle("is-open", isOpen);
  hoursStatus.classList.toggle("is-closed", !isOpen);
}

/* ---------- Newsletter ---------- */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function showNewsletterFeedback(message, isSuccess) {
  newsletterFeedback.textContent = message;
  newsletterFeedback.classList.toggle("is-success", isSuccess);
}

function handleNewsletterSubmit(event) {
  event.preventDefault();

  if (!isValidEmail(newsletterInput.value)) {
    showNewsletterFeedback(newsletterForm.dataset.errorMessage, false);
    newsletterInput.focus();
    return;
  }

  showNewsletterFeedback(newsletterForm.dataset.successMessage, true);
  newsletterForm.reset();
}

/* ---------- Back to top (with scroll progress ring) ---------- */
function updateBackToTop() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  const circumference = 2 * Math.PI * topProgress.r.baseVal.value;

  topProgress.style.strokeDasharray = circumference;
  topProgress.style.strokeDashoffset = circumference * (1 - progress);
  topButton.classList.toggle(
    "is-visible",
    window.scrollY > SHOW_TOP_BUTTON_AFTER,
  );
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Reveal + line-art drawing ---------- */
function initFooterReveal() {
  const targets = document.querySelectorAll(
    ".footer-reveal, .footer-art, .footer-divider",
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );

  targets.forEach((target) => observer.observe(target));
}

/* ---------- Events ---------- */
newsletterForm.addEventListener("submit", handleNewsletterSubmit);
newsletterInput.addEventListener("input", () =>
  showNewsletterFeedback("", false),
);
topButton.addEventListener("click", scrollToTop);
window.addEventListener("scroll", updateBackToTop, { passive: true });
window.addEventListener("resize", updateBackToTop);

setCurrentYear();
updateOpenStatus();
updateBackToTop();
initFooterReveal();
