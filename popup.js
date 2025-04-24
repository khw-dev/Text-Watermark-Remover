document.addEventListener("DOMContentLoaded", async () => {
  const chkGlobal = document.getElementById("global-enable");
  const chkSite = document.getElementById("site-enable");
  const tagsEl = document.getElementById("tags");
  const input = document.getElementById("domain-input");
  const btnSave = document.getElementById("save");
  const statusEl = document.getElementById("status");

  let domains = [];
  function renderTags() {
    tagsEl.innerHTML = "";
    domains.forEach((d, i) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = d;
      const rem = document.createElement("span");
      rem.className = "remove";
      rem.textContent = "×";
      rem.onclick = () => {
        domains.splice(i, 1);
        renderTags();
      };
      span.append(rem);
      tagsEl.append(span);
    });
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      domains.push(input.value.trim());
      input.value = "";
      renderTags();
      e.preventDefault();
    }
  });

  const prefs = await browser.storage.sync.get({
    enabled: true,
    enableOnThis: false,
    domains: [],
  });

  chkGlobal.checked = prefs.enabled;
  chkSite.checked = prefs.enableOnThis;
  domains = prefs.domains;
  renderTags();

  btnSave.addEventListener("click", () => {
    browser.storage.sync.set(
      {
        enabled: chkGlobal.checked,
        enableOnThis: chkSite.checked,
        domains,
      },
      () => {
        statusEl.textContent = "모든 변경 사항이 저장되었습니다.";
        setTimeout(() => (statusEl.textContent = ""), 1500);
      }
    );
  });
});
