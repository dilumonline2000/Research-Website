/* Researchly AI — site interactions (vanilla JS, no dependencies) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Light / dark theme toggle (initial theme is set inline in <head>) ---------- */
  var root = document.documentElement;
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function currentTheme() {
    return root.getAttribute("data-theme") || (darkQuery.matches ? "dark" : "light");
  }
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("researchly-theme", next); } catch (e) { /* storage unavailable */ }
    });
  });

  /* ---------- Mobile navigation ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var navLinks = document.querySelector(".nav-links");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) { navLinks.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- Scroll progress bar ---------- */
  var bar = document.querySelector(".progress");
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Reveal on scroll + one-shot triggers ---------- */
  var revealEls = document.querySelectorAll(".reveal, .gantt, .ms-bar, [data-count]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("in", "go");
        if (el.hasAttribute("data-count")) countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in", "go"); });
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    var sep = el.hasAttribute("data-sep");
    var fmt = function (v) {
      var s = v.toFixed(decimals);
      return sep ? Number(s).toLocaleString("en-US", { minimumFractionDigits: decimals }) : s;
    };
    if (reduceMotion) { el.textContent = fmt(target); return; }
    var start = null, dur = 1600;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Hero knowledge graph ---------- */
  var graph = document.querySelector(".hero-graph");
  if (graph) {
    var W = 1200, H = 700, NS = "http://www.w3.org/2000/svg";
    var colors = ["var(--m1)", "var(--m2)", "var(--m3)", "var(--m4)", "var(--accent)"];
    var seed = 11;
    var rand = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var nodes = [];
    for (var i = 0; i < 46; i++) {
      // keep nodes mostly on the right so the headline stays readable
      var x = W * (0.38 + rand() * 0.62), y = H * rand();
      if (rand() < 0.25) x = W * rand();
      nodes.push({ x: x, y: y, r: 1.5 + rand() * 3.2, c: colors[Math.floor(rand() * colors.length)] });
    }
    var lines = document.createDocumentFragment(), dots = document.createDocumentFragment();
    nodes.forEach(function (a, ia) {
      nodes.forEach(function (b, ib) {
        if (ib <= ia) return;
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 150) {
          var l = document.createElementNS(NS, "line");
          l.setAttribute("x1", a.x); l.setAttribute("y1", a.y); l.setAttribute("x2", b.x); l.setAttribute("y2", b.y);
          if (rand() < 0.18) l.setAttribute("class", "hot");
          lines.appendChild(l);
        }
      });
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", a.x); c.setAttribute("cy", a.y); c.setAttribute("r", a.r); c.style.fill = a.c;
      c.style.animationDelay = (-rand() * 9).toFixed(2) + "s";
      dots.appendChild(c);
      if (a.r > 3.6) {
        var p = document.createElementNS(NS, "circle");
        p.setAttribute("cx", a.x); p.setAttribute("cy", a.y); p.setAttribute("r", a.r);
        p.style.fill = "none"; p.style.stroke = a.c; p.setAttribute("class", "pulse");
        p.style.animationDelay = (-rand() * 3).toFixed(2) + "s";
        dots.appendChild(p);
      }
    });
    graph.setAttribute("viewBox", "0 0 " + W + " " + H);
    graph.setAttribute("preserveAspectRatio", "xMidYMid slice");
    graph.appendChild(lines); graph.appendChild(dots);

    if (!reduceMotion) {
      window.addEventListener("pointermove", function (e) {
        var dx = (e.clientX / window.innerWidth - 0.5) * 18;
        var dy = (e.clientY / window.innerHeight - 0.5) * 12;
        graph.style.transform = "translate(" + dx + "px," + dy + "px)";
      }, { passive: true });
    }
  }

  /* ---------- Quick find (Ctrl/⌘ + K) ---------- */
  var INDEX = [
    ["Home — project overview", "index.html", "Home"],
    ["Abstract", "index.html#abstract", "Home"],
    ["The four modules", "index.html#modules", "Home"],
    ["Demo video — platform walkthrough", "index.html#demo", "Home"],
    ["ICDMIS 2026 conference achievement", "index.html#achievement", "Home"],
    ["User feedback & testing sessions", "index.html#feedback", "Home"],
    ["Literature survey", "domain.html#literature", "Domain"],
    ["Research gap (G1–G6)", "domain.html#gap", "Domain"],
    ["Research problem", "domain.html#problem", "Domain"],
    ["Research objectives", "domain.html#objectives", "Domain"],
    ["Methodology & architecture", "domain.html#methodology", "Domain"],
    ["Results against targets", "domain.html#results", "Domain"],
    ["Technologies used", "domain.html#technologies", "Domain"],
    ["Project timeline (Gantt)", "milestones.html#timeline", "Milestones"],
    ["Project Charter / Topic Assessment", "milestones.html#ms-charter", "Milestones"],
    ["Project Proposal", "milestones.html#ms-proposal", "Milestones"],
    ["Progress Presentation 1", "milestones.html#ms-pp1", "Milestones"],
    ["Progress Presentation 2", "milestones.html#ms-pp2", "Milestones"],
    ["Research paper — ICDMIS 2026", "milestones.html#ms-paper", "Milestones"],
    ["Final assessment & thesis", "milestones.html#ms-final", "Milestones"],
    ["Viva", "milestones.html#ms-viva", "Milestones"],
    ["Project charter document", "documents.html#planning", "Documents"],
    ["Proposal documents", "documents.html#proposals", "Documents"],
    ["Checklist documents", "documents.html#checklists", "Documents"],
    ["Research paper (PDF)", "documents.html#paper", "Documents"],
    ["Final thesis — group & individual", "documents.html#final", "Documents"],
    ["Presentation slides", "presentations.html", "Presentations"],
    ["Conference poster", "presentations.html#poster", "Presentations"],
    ["Supervisors", "about.html#supervisors", "About us"],
    ["Research team", "about.html#team", "About us"],
    ["Achievements", "about.html#achievements", "About us"],
    ["Contact form", "contact.html#form", "Contact"],
    ["Phone, email & address", "contact.html#details", "Contact"],
    ["GitHub repository", "https://github.com/dilumonline2000/SLIIT-Research---Researchly-AI-project", "External"],
    ["Live platform — researchly-ai.vercel.app", "https://researchly-ai.vercel.app/", "External"],
    ["Google Drive — all documents", "https://drive.google.com/drive/folders/1Wh-0akTEBXX2C-2BqsnoxqkH0JTby54T?usp=drive_link", "External"]
  ];
  var finder = document.querySelector(".finder");
  var finderInput = finder && finder.querySelector("input");
  var finderList = finder && finder.querySelector(".finder-results");
  var active = 0;

  function render(q) {
    q = (q || "").trim().toLowerCase();
    var hits = INDEX.filter(function (r) { return !q || (r[0] + " " + r[2]).toLowerCase().indexOf(q) > -1; });
    active = 0;
    finderList.innerHTML = "";
    if (!hits.length) { finderList.innerHTML = '<li class="finder-empty">No matches — try “gap”, “team” or “slides”.</li>'; return; }
    hits.forEach(function (r, i) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = r[1];
      if (/^https?:/.test(r[1])) { a.target = "_blank"; a.rel = "noopener"; }
      a.textContent = r[0];
      var s = document.createElement("span"); s.textContent = r[2]; a.appendChild(s);
      if (i === 0) a.className = "active";
      li.appendChild(a); finderList.appendChild(li);
    });
  }
  function openFinder() { if (!finder) return; finder.classList.add("open"); render(""); finderInput.value = ""; setTimeout(function () { finderInput.focus(); }, 30); }
  function closeFinder() { if (finder) finder.classList.remove("open"); }

  if (finder) {
    document.querySelectorAll("[data-open-finder]").forEach(function (b) { b.addEventListener("click", openFinder); });
    finder.addEventListener("click", function (e) { if (e.target === finder) closeFinder(); if (e.target.closest("a")) closeFinder(); });
    finderInput.addEventListener("input", function () { render(finderInput.value); });
    finderInput.addEventListener("keydown", function (e) {
      var items = finderList.querySelectorAll("a");
      if (!items.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        items[active].classList.remove("active");
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items[active].classList.add("active");
        items[active].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") { e.preventDefault(); items[active].click(); }
    });
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); finder.classList.contains("open") ? closeFinder() : openFinder(); }
      else if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openFinder(); }
      else if (e.key === "Escape") closeFinder();
    });
  }

  /* ---------- Open a milestone if linked by hash ---------- */
  function openFromHash() {
    var t = location.hash && document.querySelector(location.hash);
    if (t && t.tagName === "DETAILS") t.open = true;
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  /* ---------- Contact form (FormSubmit AJAX, falls back to normal POST) ---------- */
  var form = document.querySelector("#contact-form");
  if (form && window.fetch) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector("button[type=submit]");
      var label = btn.innerHTML;
      btn.disabled = true; btn.textContent = "Sending…";
      status.className = "form-status";
      var data = new FormData(form);
      data.set("_subject", "[Researchly AI] " + (data.get("topic") || "Enquiry") + " — " + (data.get("name") || "Website visitor"));
      fetch(form.getAttribute("data-ajax"), { method: "POST", headers: { Accept: "application/json" }, body: data })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) === "true") {
            status.textContent = "Thank you — your message has been sent to the Researchly AI team. We'll reply to " + data.get("email") + " soon.";
            status.className = "form-status show ok";
            form.reset();
          } else { throw new Error(res.j && res.j.message); }
        })
        .catch(function (err) {
          status.textContent = "Sorry, the message could not be sent" + (err && err.message ? " (" + err.message + ")" : "") + ". Please email us directly at dttestmail2000@gmail.com.";
          status.className = "form-status show err";
        })
        .finally(function () { btn.disabled = false; btn.innerHTML = label; });
    });
  }

  /* ---------- Video: click-to-play facade (YouTube refuses file:// pages, so keep the link there) ---------- */
  document.querySelectorAll(".video-facade[data-video]").forEach(function (link) {
    if (location.protocol === "file:") return;
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + link.getAttribute("data-video") + "?autoplay=1&rel=0";
      f.title = "Researchly AI — dashboard demo video";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.referrerPolicy = "strict-origin-when-cross-origin";
      f.allowFullscreen = true;
      link.replaceWith(f);
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
