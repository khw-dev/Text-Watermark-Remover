(() => {
  const watermarkChars = [
    "\u200B",
    "\u200C",
    "\u200D",
    "\u2060",
    "\uFEFF",
    "\u202F",
    "\u00A0",
  ];

  const cleanse = (text) =>
    watermarkChars.reduce((t, ch) => t.split(ch).join(" "), text);

  let lastCleanTime = 0;
  const THRESHOLD = 50;

  const shouldSkip = () => {
    const now = Date.now();
    if (now - lastCleanTime < THRESHOLD) return true;
    lastCleanTime = now;
    return false;
  };

  if (navigator.clipboard?.writeText) {
    const orig = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = async (data) => {
      if (shouldSkip()) return orig(data);
      const cleaned = cleanse(data);
      console.log("[T.W.R.] all text watermarks removed");
      return orig(cleaned);
    };
  }

  if (navigator.clipboard?.write) {
    const orig = navigator.clipboard.write.bind(navigator.clipboard);
    navigator.clipboard.write = async (items) => {
      if (shouldSkip()) return orig(items);
      const newItems = await Promise.all(
        items.map(async (item) => {
          const blobs = {};
          for (const type of item.types) {
            const b = await item.getType(type);
            if (type === "text/plain") {
              const text = await b.text();
              blobs[type] = new Blob([cleanse(text)], { type });
            } else blobs[type] = b;
          }
          console.log("[T.W.R.] all text watermarks removed");
          return new ClipboardItem(blobs);
        })
      );
      return orig(newItems);
    };
  }

  document.addEventListener(
    "copy",
    (e) => {
      if (shouldSkip()) return;
      const sel = window.getSelection().toString();
      const cleaned = cleanse(sel);
      e.clipboardData.setData("text/plain", cleaned);
      e.clipboardData.setData("text/html", cleaned);
      e.preventDefault();
      console.log("[T.W.R.] all text watermarks removed");
    },
    true
  );

  console.log("[T.W.R.] all interceptors installed");
})();
