// Content script — finds the active textarea on supported AI sites,
// adds an "Enhance" button next to it, and replaces its value with the
// final prompt returned by the SaaS.

(function () {
  const HOST = location.hostname;
  const TARGET_MODEL = (() => {
    if (HOST.includes("openai") || HOST.includes("chatgpt")) return "chatgpt";
    if (HOST.includes("claude")) return "claude";
    if (HOST.includes("copilot")) return "copilot";
    if (HOST.includes("gemini") || HOST.includes("bard")) return "gemini";
    return "generic";
  })();

  function findInput() {
    return (
      document.querySelector('textarea[data-id="root"]') ||
      document.querySelector('textarea[placeholder*="Message" i]') ||
      document.querySelector('textarea[placeholder*="Send" i]') ||
      document.querySelector('div[contenteditable="true"]') ||
      document.querySelector("textarea")
    );
  }

  function readValue(el) {
    if (el.tagName === "TEXTAREA") return el.value;
    return el.innerText;
  }

  function writeValue(el, value) {
    if (el.tagName === "TEXTAREA") {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      setter.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      el.innerText = value;
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
    }
  }

  function ensureButton(el) {
    if (el.dataset.poInjected === "1") return;
    el.dataset.poInjected = "1";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "po-enhance-btn";
    btn.textContent = "✨ Enhance";
    btn.title = "Enhance with Prompt Orchestrator";

    const wrap = document.createElement("div");
    wrap.className = "po-wrap";
    wrap.appendChild(btn);

    el.parentElement?.appendChild(wrap);

    btn.addEventListener("click", async () => {
      const raw = readValue(el).trim();
      if (raw.length < 3) return;
      btn.disabled = true;
      btn.textContent = "Thinking…";
      try {
        const resp = await chrome.runtime.sendMessage({
          type: "ENHANCE",
          payload: { raw_prompt: raw, target_model: TARGET_MODEL }
        });
        if (!resp?.ok) throw new Error(resp?.error || "enhance failed");
        writeValue(el, resp.data.final_prompt);
        btn.textContent = "✓ Enhanced";
      } catch (e) {
        console.error("[PO]", e);
        btn.textContent = "Error";
      } finally {
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = "✨ Enhance";
        }, 1500);
      }
    });
  }

  const observer = new MutationObserver(() => {
    const el = findInput();
    if (el) ensureButton(el);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // initial pass
  const initial = findInput();
  if (initial) ensureButton(initial);
})();
