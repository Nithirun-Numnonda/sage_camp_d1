import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers.js';

describe('Feature A: Edit announcement', () => {
  let srv;

  beforeEach(async () => {
    srv = await startTestServer();
  });

  afterEach(async () => {
    await srv.close();
  });

  test('PATCH /api/announcements/:id แก้ไขหัวข้อได้ และฟิลด์ที่ไม่ได้ส่งยังเป็นค่าเดิม', async () => {
    const res = await srv.request('PATCH', '/api/announcements/1', { title: 'Updated title' });
    assert.equal(res.status, 200);
    assert.equal(res.data.id, 1);
    assert.equal(res.data.title, 'Updated title');
    assert.equal(res.data.body, 'แอปนี้ใช้ฝึก Git, Pull Request, CI และการ Deploy ด้วย Docker / PM2');
    assert.ok(res.data.updatedAt);

    // ตรวจสอบผ่าน GET
    const getRes = await srv.request('GET', '/api/announcements/1');
    assert.equal(getRes.status, 200);
    assert.equal(getRes.data.title, 'Updated title');
  });

  test('PATCH /api/announcements/:id แก้ไข body อย่างเดียวได้ และ title ยังคงเดิม', async () => {
    const res = await srv.request('PATCH', '/api/announcements/1', { body: 'ข้อความรายละเอียดใหม่' });
    assert.equal(res.status, 200);
    assert.equal(res.data.title, 'ยินดีต้อนรับสู่บอร์ดประกาศ');
    assert.equal(res.data.body, 'ข้อความรายละเอียดใหม่');
  });

  test('PATCH /api/announcements/:id ส่งฟิลด์อื่นมาด้วยต้องไม่ถูกบันทึก', async () => {
    const res = await srv.request('PATCH', '/api/announcements/1', {
      title: 'Again',
      pinned: true,
      extraField: 'should not be saved',
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.title, 'Again');
    assert.equal(res.data.pinned, undefined);
    assert.equal(res.data.extraField, undefined);

    const storedItem = srv.store.get(1);
    assert.equal(storedItem.pinned, undefined);
    assert.equal(storedItem.extraField, undefined);
  });

  test('PATCH /api/announcements/:id แก้ไขทั้ง title และ body พร้อมกันได้', async () => {
    const res = await srv.request('PATCH', '/api/announcements/1', {
      title: 'หัวข้อใหม่ทั้งหมด',
      body: 'รายละเอียดใหม่ทั้งหมด',
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.id, 1);
    assert.equal(res.data.title, 'หัวข้อใหม่ทั้งหมด');
    assert.equal(res.data.body, 'รายละเอียดใหม่ทั้งหมด');
    assert.ok(res.data.updatedAt);
  });

  test('PATCH /api/announcements/:id หัวข้อว่าง หรือยาวเกิน → 400', async () => {
    const emptyRes = await srv.request('PATCH', '/api/announcements/1', { title: '   ' });
    assert.equal(emptyRes.status, 400);
    assert.ok(emptyRes.data.error);

    const longRes = await srv.request('PATCH', '/api/announcements/1', { title: 'a'.repeat(121) });
    assert.equal(longRes.status, 400);
    assert.ok(longRes.data.error);

    const longBodyRes = await srv.request('PATCH', '/api/announcements/1', { body: 'b'.repeat(1001) });
    assert.equal(longBodyRes.status, 400);
    assert.ok(longBodyRes.data.error);
  });

  test('PATCH /api/announcements/:id ไม่พบประกาศ หรือ id ไม่ถูกต้อง → 404', async () => {
    const notFoundRes = await srv.request('PATCH', '/api/announcements/9999', { title: 'x' });
    assert.equal(notFoundRes.status, 404);
    assert.equal(notFoundRes.data.error, 'ไม่พบประกาศ');

    const invalidIdRes = await srv.request('PATCH', '/api/announcements/abc', { title: 'x' });
    assert.equal(invalidIdRes.status, 404);
    assert.equal(invalidIdRes.data.error, 'ไม่พบประกาศ');
  });
});
