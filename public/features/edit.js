// โมดูล A — แก้ไขประกาศ  ·  branch: feature/edit
// หน้าเว็บของฟีเจอร์ — ดูเครื่องมือที่ใช้ได้ใน ctx ที่หัวไฟล์ public/app.js

export function init(ctx) {
  ctx.addItemHook((item, { actions }) => {
    const editBtn = document.createElement('button');
    editBtn.className = 'link';
    editBtn.textContent = 'แก้ไข';
    editBtn.onclick = async () => {
      const title = window.prompt('แก้ไขหัวข้อ', item.title);
      if (title === null) return;
      const body = window.prompt('แก้ไขรายละเอียด', item.body);
      if (body === null) return;

      const res = await ctx.api(`/api/announcements/${item.id}`, {
        method: 'PATCH',
        body: { title, body },
      });

      if (!res.ok) {
        return ctx.notify(res.data?.error || 'เกิดข้อผิดพลาด');
      }
      ctx.reload();
    };
    actions.append(editBtn);
  });
}
