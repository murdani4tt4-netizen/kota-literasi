/** Offline-friendly printing: opens a styled document in a new window. */
export function printHTML(title: string, bodyHTML: string) {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) {
    alert("Popup diblokir browser. Izinkan popup untuk mencetak, atau gunakan Ctrl+P pada halaman hasil.");
    return;
  }
  w.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; margin: 34px; color: #14202e; line-height: 1.6; }
    h1 { font-size: 21px; border-bottom: 3px double #14202e; padding-bottom: 8px; letter-spacing: .5px; }
    h2 { font-size: 15px; margin-top: 26px; border-left: 5px solid #b8860b; padding-left: 8px; }
    .q { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; margin: 10px 0; page-break-inside: avoid; }
    .q p { margin: 4px 0; }
    .foot { margin-top: 30px; font-size: 11px; color: #475569; border-top: 1px solid #cbd5e1; padding-top: 8px; }
    @media print { body { margin: 14mm; } }
  </style></head><body>${bodyHTML}
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
  </body></html>`);
  w.document.close();
}
