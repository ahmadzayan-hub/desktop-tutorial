const $ = (id) => document.getElementById(id);

(async () => {
  const cfg = await chrome.storage.sync.get(["apiBase", "apiKey"]);
  $("apiBase").value = cfg.apiBase || "http://localhost:3000";
  $("apiKey").value = cfg.apiKey || "dev-extension-key";
})();

$("save").addEventListener("click", async () => {
  await chrome.storage.sync.set({
    apiBase: $("apiBase").value.trim(),
    apiKey: $("apiKey").value.trim()
  });
  $("status").textContent = "Saved.";
  setTimeout(() => ($("status").textContent = ""), 1500);
});
