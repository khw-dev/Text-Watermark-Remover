(async () => {
  const url = location.href;

  const toReg = (g) =>
    new RegExp(
      "^" + g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$"
    );

  const inject = () => {
    const s = document.createElement("script");
    s.src = browser.runtime.getURL("inject.js");
    (document.head || document.documentElement).append(s);
  };

  const pref = await browser.storage.sync.get({
    enabled: true,
    enableOnThis: false,
    domains: [],
  });

  let should = false;
  if (pref.enabled) should = true;
  else if (pref.enableOnThis) should = true;
  else if (pref.domains.some((d) => toReg(d).test(url))) should = true;

  if (should) inject();
})();
