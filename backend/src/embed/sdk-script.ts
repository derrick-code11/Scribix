const EMBED_SDK_SCRIPT = `(function () {
  var VERSION = "1.0.0";
  var GLOBAL_KEY = "ScribixEmbed";
  var SCRIPT_FLAG = "scribixEmbedInitialized";

  function normalizeBaseUrl(baseUrl) {
    if (!baseUrl) return "";
    return String(baseUrl).replace(/\\/$/, "");
  }

  function defaultApiBase() {
    try {
      var scripts = document.querySelectorAll('script[src*="/api/v1/embed/sdk.js"]');
      if (scripts.length) {
        var last = scripts[scripts.length - 1];
        var src = last.getAttribute("src");
        if (src) {
          var parsed = new URL(src, window.location.href);
          return normalizeBaseUrl(parsed.origin + "/api/v1");
        }
      }
    } catch (_e) {}
    return normalizeBaseUrl(window.location.origin + "/api/v1");
  }

  function clampNumber(value, min, max, fallback) {
    var n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.floor(n)));
  }

  function buildUrl(base, username, limit, offset) {
    var apiBase = normalizeBaseUrl(base || defaultApiBase());
    var url = apiBase + "/embed/" + encodeURIComponent(username) + "/posts";
    var search = new URLSearchParams();
    search.set("limit", String(limit));
    search.set("offset", String(offset));
    return url + "?" + search.toString();
  }

  function asError(code, message, details) {
    var err = new Error(message);
    err.code = code;
    if (details !== undefined) err.details = details;
    return err;
  }

  async function getPosts(options) {
    var opts = options || {};
    var username = String(opts.username || "").trim();
    if (!username) {
      throw asError("INVALID_USERNAME", "username is required");
    }

    var limit = clampNumber(opts.limit, 1, 20, 6);
    var offset = clampNumber(opts.offset, 0, 200, 0);
    var requestUrl = buildUrl(opts.apiBaseUrl, username, limit, offset);

    var res = await fetch(requestUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    var payload = null;
    try {
      payload = await res.json();
    } catch (_e) {
      throw asError("BAD_RESPONSE", "Embed API returned invalid JSON");
    }

    if (!res.ok || !payload || payload.error) {
      var code = (payload && payload.error && payload.error.code) || "EMBED_API_ERROR";
      var message = (payload && payload.message) || "Failed to fetch Scribix posts";
      var details = payload && payload.error ? payload.error.details : undefined;
      throw asError(code, message, details);
    }

    return payload.data;
  }

  function createElement(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = String(text);
    return el;
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (_e) {
      return date.toISOString().slice(0, 10);
    }
  }

  function resolveItemUrl(item) {
    if (item.absolute_url) return item.absolute_url;
    if (item.url) return item.url;
    return "#";
  }

  function renderPosts(target, feed, options) {
    var opts = options || {};
    var openInNewTab = !!opts.openInNewTab;
    var classPrefix = String(opts.classPrefix || "scribix-embed");
    target.innerHTML = "";

    var root = createElement("section", classPrefix + "-root");
    var list = createElement("div", classPrefix + "-list");
    var items = Array.isArray(feed.items) ? feed.items : [];

    if (!items.length) {
      root.appendChild(
        createElement("p", classPrefix + "-empty", "No published Scribix posts yet.")
      );
      target.appendChild(root);
      return;
    }

    for (var i = 0; i < items.length; i++) {
      var item = items[i] || {};
      var card = createElement("article", classPrefix + "-card");
      var title = createElement("h3", classPrefix + "-title");
      var link = createElement("a", classPrefix + "-link", item.title || "Untitled post");
      link.setAttribute("href", resolveItemUrl(item));
      if (openInNewTab) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
      title.appendChild(link);
      card.appendChild(title);

      if (item.excerpt) {
        card.appendChild(createElement("p", classPrefix + "-excerpt", item.excerpt));
      }

      var publishedText = formatDate(item.published_at);
      if (publishedText) {
        var meta = createElement("p", classPrefix + "-meta");
        var time = createElement("time", classPrefix + "-time", publishedText);
        time.setAttribute("datetime", String(item.published_at));
        meta.appendChild(time);
        card.appendChild(meta);
      }

      list.appendChild(card);
    }

    root.appendChild(list);
    target.appendChild(root);
  }

  function renderError(target, message, classPrefix) {
    target.innerHTML = "";
    target.appendChild(
      createElement("p", classPrefix + "-error", message || "Failed to load Scribix posts.")
    );
  }

  function resolveTarget(selector, scriptEl) {
    if (selector) {
      var bySelector = document.querySelector(selector);
      if (bySelector) return bySelector;
    }
    var explicitTargetId = scriptEl && scriptEl.dataset ? scriptEl.dataset.scribixTargetId : "";
    if (explicitTargetId) {
      var byId = document.getElementById(explicitTargetId);
      if (byId) return byId;
    }
    return scriptEl ? scriptEl.parentElement : null;
  }

  async function mount(options) {
    var opts = options || {};
    var target = opts.target || null;
    var classPrefix = String(opts.classPrefix || "scribix-embed");
    var feed = await getPosts(opts);
    if (target) {
      renderPosts(target, feed, opts);
    }
    return feed;
  }

  function scriptOptions(scriptEl) {
    var d = (scriptEl && scriptEl.dataset) || {};
    return {
      username: d.scribixUsername || "",
      limit: d.scribixLimit,
      offset: d.scribixOffset,
      apiBaseUrl: d.scribixApiBase || "",
      targetSelector: d.scribixTarget || "",
      openInNewTab: d.scribixNewTab === "true",
      classPrefix: d.scribixClassPrefix || "scribix-embed",
      mode: d.scribixMode || "widget",
    };
  }

  async function bootstrapScript(scriptEl) {
    if (!scriptEl || scriptEl.dataset[SCRIPT_FLAG] === "true") return;
    scriptEl.dataset[SCRIPT_FLAG] = "true";

    var opts = scriptOptions(scriptEl);
    if (!opts.username) return;
    var target = resolveTarget(opts.targetSelector, scriptEl);
    var mode = String(opts.mode).toLowerCase();

    try {
      var feed = await getPosts(opts);
      if (mode !== "data" && target) {
        renderPosts(target, feed, opts);
      }
      if (mode === "data" && target) {
        target.dataset.scribixLoaded = "true";
      }
    } catch (err) {
      if (target) {
        renderError(target, err && err.message, opts.classPrefix || "scribix-embed");
      }
    }
  }

  function init() {
    var scripts = document.querySelectorAll('script[data-scribix-username]');
    for (var i = 0; i < scripts.length; i++) {
      bootstrapScript(scripts[i]);
    }
  }

  window[GLOBAL_KEY] = {
    version: VERSION,
    getPosts: getPosts,
    mount: mount,
    init: init,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();`;

export function getEmbedSdkScript(): string {
  return EMBED_SDK_SCRIPT;
}
