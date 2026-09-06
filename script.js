// Google Analytics 4 for Amazing Nana
(function initGoogleAnalytics() {
  const measurementId = 'G-W71K9PELRB';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true
  });

  const analyticsScript = document.createElement('script');
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(analyticsScript);
})();

// Small sitewide consistency layer. This is kept here so older content pages
// inherit the same button, disclosure, breadcrumb and footer behavior.
(function applySitewidePolish() {
  const style = document.createElement('style');
  style.textContent = `
    .card a.btn-primary{color:#fff}
    .btn-secondary,.card a.btn-secondary{color:var(--ink)}
    a.btn[href*="amazon.com"],a.btn[href*="amzn.to"]{background:#fff;border-color:var(--line);color:var(--ink);box-shadow:none}
    a.btn[href*="amazon.com"]:hover,a.btn[href*="amzn.to"]:hover{border-color:#d8bde7;box-shadow:0 8px 20px rgba(116,69,117,.10)}
    .footer .brand{display:flex;color:var(--ink);margin:0 0 10px}
    .footer .legal a{display:inline;margin:0;color:var(--purple-dark);font-weight:800}
    .breadcrumbs{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 16px;font-size:.88rem;color:#746878}
    .breadcrumbs a{color:var(--purple-dark);font-weight:800;text-decoration:none}
    .breadcrumbs a:hover{text-decoration:underline}

    /* Pills now have two clear meanings: links look clickable; labels do not. */
    .kicker-row .kicker:not(a){background:rgba(138,91,213,.08);border:0;box-shadow:none;color:#6f6476;cursor:default;padding:7px 11px}
    .kicker-row a.kicker{background:#fff;border:1px solid var(--line);box-shadow:0 5px 14px rgba(116,69,117,.07);color:var(--purple-dark);cursor:pointer;text-decoration:none;padding:8px 12px}
    .kicker-row a.kicker::after{content:'›';font-size:1.05em;margin-left:3px}
    .kicker-row a.kicker:hover{border-color:#d6bde6;box-shadow:0 8px 18px rgba(116,69,117,.11);transform:translateY(-1px)}

    /* Eyebrows are section labels, not buttons. */
    .eyebrow{background:transparent;border:0;border-left:3px solid var(--pink);border-radius:0;box-shadow:none;padding:2px 0 2px 9px;cursor:default}

    .btn:focus-visible,.nav-links a:focus-visible,.breadcrumbs a:focus-visible,.kicker-row a.kicker:focus-visible{outline:3px solid rgba(138,91,213,.28);outline-offset:3px}
    @media(max-width:640px){a.btn[href*="amazon.com"],a.btn[href*="amzn.to"]{width:100%}}
  `;
  document.head.appendChild(style);
})();

// Fill in metadata that a few of the older pages did not originally include.
// Existing hand-written metadata always wins; these are fallbacks only.
(function ensureMetadataConsistency() {
  const description = document.querySelector('meta[name="description"]')?.content || '';
  const firstImage = document.querySelector('.page-photo img,.hero-photo img,.product-image img')?.src || '';

  const ensureMeta = (selector, attrs) => {
    if (document.head.querySelector(selector)) return;
    const meta = document.createElement('meta');
    Object.entries(attrs).forEach(([key, value]) => meta.setAttribute(key, value));
    document.head.appendChild(meta);
  };

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = `${window.location.origin}${window.location.pathname}`;
    document.head.appendChild(canonical);
  }

  ensureMeta('meta[name="robots"]', { name: 'robots', content: 'index,follow,max-image-preview:large' });
  ensureMeta('meta[property="og:type"]', { property: 'og:type', content: document.querySelector('script[type="application/ld+json"]')?.textContent.includes('Recipe') ? 'article' : 'website' });
  ensureMeta('meta[property="og:title"]', { property: 'og:title', content: document.title });
  if (description) ensureMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonical.href });
  if (firstImage) ensureMeta('meta[property="og:image"]', { property: 'og:image', content: firstImage });
  ensureMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Amazing Nana' });
  ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: firstImage ? 'summary_large_image' : 'summary' });

  const logoUrl = `${window.location.origin}/assets/favicon.svg`;
  const canonicalUrl = canonical.href;
  const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));

  if (jsonLdScripts.length === 0) {
    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: document.title.replace(/\s*\|\s*Amazing Nana.*$/, ''),
      url: canonicalUrl,
      description,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Amazing Nana',
        url: `${window.location.origin}/`
      }
    });
    document.head.appendChild(schema);
    jsonLdScripts.push(schema);
  }

  jsonLdScripts.forEach((script) => {
    try {
      const data = JSON.parse(script.textContent);
      let changed = false;

      const enrich = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
          node.forEach(enrich);
          return;
        }

        if (node['@type'] === 'Recipe') {
          if (!node.image && firstImage) { node.image = firstImage; changed = true; }
          if (!node.author) { node.author = { '@type': 'Organization', name: 'Amazing Nana' }; changed = true; }
          if (!node.datePublished) { node.datePublished = '2026-09-06'; changed = true; }
          if (!node.dateModified) { node.dateModified = '2026-09-06'; changed = true; }
          if (!node.mainEntityOfPage) { node.mainEntityOfPage = canonicalUrl; changed = true; }
        }

        if (node['@type'] === 'Organization' && !node.logo) {
          node.logo = { '@type': 'ImageObject', url: logoUrl };
          changed = true;
        }

        if (node.publisher && typeof node.publisher === 'object' && !node.publisher.logo) {
          node.publisher.logo = { '@type': 'ImageObject', url: logoUrl };
          changed = true;
        }

        Object.values(node).forEach(enrich);
      };

      enrich(data);
      if (changed) script.textContent = JSON.stringify(data);
    } catch (_) {
      // Leave any hand-written JSON-LD untouched if it cannot be parsed.
    }
  });
})();

const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');

if (toggle && links) {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');

  const closeMenu = () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  };

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (!links.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Turn only meaningful navigation pills into real links. All other kicker pills
// remain informational and are styled as labels rather than buttons.
(function makeKickerNavigationFunctional() {
  const path = window.location.pathname || '/';
  const maps = {
    '/finds.html': {
      'Games': 'best-games-for-grandkids-at-grandmas-house.html',
      'Grandma-house basics': 'things-to-keep-at-grandmas-house.html',
      'Kitchen': 'easy-recipes-to-make-with-grandkids.html',
      'Gifts': 'grandma-gifts.html'
    },
    '/grandkids.html': {
      'Activities': 'things-to-do-with-grandkids.html',
      'Games': 'best-games-for-grandkids-at-grandmas-house.html',
      'Recipes': 'easy-recipes-to-make-with-grandkids.html',
      'Traditions': 'things-to-do-with-grandkids.html'
    },
    '/grandma-gifts.html': {
      'Christmas': 'christmas-gifts-for-grandma.html',
      'Birthdays': 'gifts-for-grandma-from-grandkids.html',
      'Mother’s Day': 'gifts-for-grandma-from-grandkids.html',
      'Just because': 'gifts-for-grandma-from-grandkids.html'
    },
    '/things-to-do-with-grandkids.html': {
      'Indoor fun': '#easy-indoor-activities',
      'Outdoor ideas': '#outdoor-ideas',
      'Rainy days': '#easy-indoor-activities',
      'Older kids too': '#ideas-for-older-grandkids-and-teens'
    },
    '/gifts-for-grandma-from-grandkids.html': {
      'Sentimental': '#sentimental-gifts-grandma-can-keep',
      'Useful': '#useful-gifts-that-still-feel-special',
      'Homemade': '#homemade-gifts-from-younger-grandkids',
      'Experience gifts': '#experience-gifts'
    },
    '/easy-recipes-to-make-with-grandkids.html': {
      'Baking': 'nanas-chocolate-chip-cookies.html',
      'Breakfast': 'fluffy-buttermilk-pancakes.html',
      'No-bake': 'no-bake-peanut-butter-oat-bites.html',
      'Kid-helper friendly': 'recipes.html'
    }
  };

  // Add stable anchors to article section headings so in-page pills work.
  const slugify = (text) => text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  document.querySelectorAll('main h2').forEach((heading) => {
    if (!heading.id) heading.id = slugify(heading.textContent.trim());
    heading.style.scrollMarginTop = '96px';
  });

  const pageMap = maps[path];
  if (!pageMap) return;

  document.querySelectorAll('.kicker-row .kicker').forEach((pill) => {
    if (pill.tagName === 'A') return;
    const label = pill.textContent.trim();
    const href = pageMap[label];
    if (!href) return;

    const link = document.createElement('a');
    link.className = pill.className;
    link.href = href;
    link.textContent = label;
    link.setAttribute('aria-label', `Go to ${label}`);
    pill.replaceWith(link);
  });
})();

// Keep Amazon shopping calls-to-action visually and technically consistent.
document.querySelectorAll('a.btn[href*="amazon.com"], a.btn[href*="amzn.to"]').forEach((button) => {
  button.classList.remove('btn-primary');
  button.classList.add('btn-secondary');
  button.setAttribute('target', '_blank');

  const rel = new Set((button.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
  ['sponsored', 'nofollow', 'noopener'].forEach((value) => rel.add(value));
  button.setAttribute('rel', Array.from(rel).join(' '));
});

// Make the sitewide Amazon relationship clear even on editorial pages that do
// not contain a shopping block themselves.
const footerLegalBlocks = document.querySelectorAll('.footer .legal');
const footerLegal = footerLegalBlocks[footerLegalBlocks.length - 1];
if (footerLegal && !footerLegal.textContent.includes('Amazon Associate')) {
  footerLegal.innerHTML = `As an Amazon Associate I earn from qualifying purchases. ${footerLegal.innerHTML}`;
}

// Keep full affiliate disclosure boxes out of article intros. Move them to the
// footer consistently across all monetized guides.
document.querySelectorAll('.shop-note').forEach((disclosure) => {
  if (!footerLegal || disclosure.closest('.footer')) return;

  const footerDisclosure = document.createElement('div');
  footerDisclosure.className = 'legal';
  footerDisclosure.innerHTML = '<strong>Affiliate disclosure:</strong> This page contains Amazon affiliate links. As an Amazon Associate I earn from qualifying purchases, at no extra cost to you. Prices and availability can change. <a href="disclosure.html">Learn more</a>.';
  footerLegal.before(footerDisclosure);
  disclosure.remove();
});

// Add consistent breadcrumbs to deep editorial guides that did not originally
// have them. The Grandma's House checklist already includes its own breadcrumb.
const breadcrumbMap = {
  '/things-to-do-with-grandkids.html': [
    ['Home', 'index.html'],
    ['For Grandkids', 'grandkids.html'],
    ['Things to Do With Grandkids', null]
  ],
  '/best-games-for-grandkids-at-grandmas-house.html': [
    ['Home', 'index.html'],
    ["Nana's Finds", 'finds.html'],
    ["Games for Grandma's House", null]
  ],
  '/gifts-for-grandma-from-grandkids.html': [
    ['Home', 'index.html'],
    ['For Grandma', 'grandma-gifts.html'],
    ['Gifts From Grandkids', null]
  ],
  '/christmas-gifts-for-grandma.html': [
    ['Home', 'index.html'],
    ['For Grandma', 'grandma-gifts.html'],
    ['Christmas Gifts', null]
  ],
  '/easy-recipes-to-make-with-grandkids.html': [
    ['Home', 'index.html'],
    ['Recipes', 'recipes.html'],
    ['Easy Recipes With Grandkids', null]
  ]
};

const crumbs = breadcrumbMap[window.location.pathname];
const article = document.querySelector('main .article');
if (crumbs && article && !article.querySelector('.breadcrumbs')) {
  const nav = document.createElement('nav');
  nav.className = 'breadcrumbs';
  nav.setAttribute('aria-label', 'Breadcrumb');

  crumbs.forEach(([label, href], index) => {
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      nav.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.textContent = label;
      nav.appendChild(span);
    }

    if (index < crumbs.length - 1) {
      const separator = document.createElement('span');
      separator.setAttribute('aria-hidden', 'true');
      separator.textContent = '›';
      nav.appendChild(separator);
    }
  });

  article.prepend(nav);
}

// Keep the first Grandma's House recommendation visibly distinguished without
// using a different Amazon button style.
if (window.location.pathname.endsWith('/things-to-keep-at-grandmas-house.html')) {
  const featuredCard = document.querySelector('.essentials .essential');
  if (featuredCard && !featuredCard.querySelector('.badge')) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'Featured pick';
    featuredCard.prepend(badge);
  }
}

function inferAffiliateProductName(link) {
  if (link.dataset.product) return link.dataset.product;

  const card = link.closest('.essential,.game,.gift,.quick,.gear,.pick-card,.mini-pick,.shop-card,.product-card');
  const heading = card && card.querySelector('h2,h3,strong');
  return heading ? heading.textContent.trim() : (link.textContent || '').trim();
}

function inferAffiliateCategory(link) {
  if (link.dataset.affiliateCategory) return link.dataset.affiliateCategory;
  const path = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '');
  return path || 'homepage';
}

// Track monetization clicks in GA4 so we can see which page, category and product
// produces buying intent before Amazon reports a commission.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || typeof window.gtag !== 'function') return;

  const href = link.href;
  const isAmazonAffiliate = /amazon\.com|amzn\.to/i.test(href);

  if (isAmazonAffiliate) {
    window.gtag('event', 'affiliate_click', {
      affiliate_network: 'Amazon',
      product_name: inferAffiliateProductName(link),
      affiliate_category: inferAffiliateCategory(link),
      link_url: href,
      link_text: (link.textContent || '').trim(),
      page_path: window.location.pathname,
      page_title: document.title
    });
  }
});
