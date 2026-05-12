const fs = require('fs');
const path = 'src/components/admin/TripFormModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Copied EXACTLY from previous output
const target = `                         <div className="grid grid-cols-2 gap-3">
                           <Input type="number" value={v.originalPrice} placeholder="Original Price" onChange={(e) => { const updated = [...form.variants]; updated[i].originalPrice = Number(e.target.value); setForm({ ...form, variants: updated }); }} className="h-9 text-xs" />
                           <Input type="number" value={v.discountedPrice} placeholder="Discounted Price" onChange={(e) => { const updated = [...form.variants]; updated[i].discountedPrice = Number(e.target.value); setForm({ ...form, variants: updated }); }} className="h-9 text-xs" />
                         </div>`;

const replacement = `                         <div className="grid grid-cols-3 gap-3">
                           <Input type="number" value={v.originalPrice} placeholder="Orig. Price" onChange={(e) => { const updated = [...form.variants]; updated[i].originalPrice = Number(e.target.value); setForm({ ...form, variants: updated }); }} className="h-9 text-xs" />
                           <Input type="number" value={v.discountedPrice} placeholder="Disc. Price" onChange={(e) => { const updated = [...form.variants]; updated[i].discountedPrice = Number(e.target.value); setForm({ ...form, variants: updated }); }} className="h-9 text-xs" />
                           <Input type="number" value={v.skipDays || 0} placeholder="Skip Days" title="Days to remove from start" onChange={(e) => { const updated = [...form.variants]; updated[i].skipDays = Number(e.target.value); setForm({ ...form, variants: updated }); }} className="h-9 text-xs" />
                         </div>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log("✅ Replacement successful");
} else {
    const targetRN = target.replace(/\n/g, '\r\n');
    if (content.includes(targetRN)) {
        content = content.replace(targetRN, replacement.replace(/\n/g, '\r\n'));
        fs.writeFileSync(path, content);
        console.log("✅ Replacement successful (with \\r\\n)");
    } else {
        console.log("❌ Target not found AGAIN");
    }
}
