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

  // sol 1
  if (navigator.clipboard?.writeText) {
    const origWriteText = navigator.clipboard.writeText.bind(
      navigator.clipboard
    );
    navigator.clipboard.writeText = async (data) => {
      const cleaned = cleanse(data);
      console.log(`Text watermarks removed.`);
      return origWriteText(cleaned);
    };
  }

  // sol 2
  if (navigator.clipboard?.write) {
    const origWrite = navigator.clipboard.write.bind(navigator.clipboard);
    navigator.clipboard.write = async (items) => {
      const newItems = await Promise.all(
        items.map(async (item) => {
          const blobs = {};
          for (const type of item.types) {
            const blob = await item.getType(type);
            if (type === "text/plain") {
              const text = await blob.text();
              const cleaned = cleanse(text);
              console.log(`Text watermarks removed.`);
              blobs[type] = new Blob([cleaned], { type });
            } else blobs[type] = blob;
          }
          return new ClipboardItem(blobs);
        })
      );
      return origWrite(newItems);
    };
  }

  // sol 3
  {
    const origExec = Document.prototype.execCommand;
    Document.prototype.execCommand = (cmd, ...args) => {
      if (cmd.toLowerCase() === "copy") {
        const sel = window.getSelection().toString();
        const cleaned = cleanse(sel);
        const ta = document.createElement("textarea");
        ta.value = cleaned;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const result = origExec.call(this, "copy", ...args);
        document.body.removeChild(ta);
        console.log(`Text watermarks removed.`);
        return result;
      }
      return origExec.call(this, cmd, ...args);
    };
  }

  // sol 4
  document.addEventListener(
    "copy",
    (e) => {
      const sel = window.getSelection().toString();
      const cleaned = cleanse(sel);
      e.clipboardData.setData("text/plain", cleaned);
      e.clipboardData.setData("text/html", cleaned);
      e.preventDefault();
      console.log(`Text watermarks removed.`);
    },
    true
  );

  console.log("[T.W.R.] Injected all content scripts!");
})();
