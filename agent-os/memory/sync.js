#!/usr/bin/env node
'use strict';
// 🗄️ Memory — مزامنة تلقائية لسجل الجلسات من تاريخ Git.
// بيقرأ آخر الـ commits المهمّة (دمج PR / إصدار / feat) ويكتبها في قسم مُعلّم
// جوه sessions-log.md بين <!-- AUTO:START --> و <!-- AUTO:END -->.
// مفيش أي اعتماديات — Node و git بس. Idempotent: يشتغل مليون مرة يطلع نفس الناتج.
//
// تشغيل يدوي:   node agent-os/memory/sync.js
// في CI:        بيتنادى من .github/workflows/memory-sync.yml بعد كل دمج على main.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LOG_FILE = path.join(__dirname, 'sessions-log.md');
const START = '<!-- AUTO:START -->';
const END = '<!-- AUTO:END -->';
const MAX = 25; // أحدث كام قيد نعرضهم

function git(args) {
  try { return execSync('git ' + args, { encoding: 'utf8', cwd: path.join(__dirname, '..', '..') }).trim(); }
  catch (e) { return ''; }
}

// بنجيب الـ commits اللي وليها معنى «ميلستون». بنستخدم tab (%x09) كفاصل حقول
// عشان عنوان الـ commit ممكن يحتوي أي رمز غير الـ tab.
function milestones() {
  const raw = git('log --no-merges --date=short --pretty=format:%h%x09%ad%x09%s -n 200');
  if (!raw) return [];
  const rows = raw.split('\n').map((l) => {
    const parts = l.split('\t');
    return { hash: parts[0] || '', date: parts[1] || '', subject: (parts[2] || '').trim() };
  });
  // نختار القيود المهمّة: دمج PR (#123)، إصدار، أو بادئات feat/إضافة واضحة.
  const keep = /(#\d+)|^feat|^Add |أضف|إضافة|إصدار|release|OS:|CI:|توقيع|نشر/i;
  // نستبعد ضوضاء المزامنة نفسها عشان ما ندخلش في حلقة.
  const skip = /chore\(memory\)|sync sessions log/i;
  return rows.filter((r) => r.subject && keep.test(r.subject) && !skip.test(r.subject)).slice(0, MAX);
}

function buildSection(items) {
  const lines = [START, '', '## سجل تلقائي (Auto Log) — من تاريخ Git', ''];
  if (!items.length) {
    lines.push('_مفيش قيود بعد._');
  } else {
    lines.push('| التاريخ | الميلستون | commit |', '| --- | --- | --- |');
    items.forEach((it) => {
      const subj = it.subject.replace(/\|/g, '\\|');
      lines.push('| ' + it.date + ' | ' + subj + ' | `' + it.hash + '` |');
    });
  }
  lines.push('', '> بيتولّد أوتوماتيك بواسطة `agent-os/memory/sync.js` — متعدّلش القسم ده بإيدك.', '', END);
  return lines.join('\n');
}

function main() {
  let doc = '';
  try { doc = fs.readFileSync(LOG_FILE, 'utf8'); } catch (e) { doc = '# 🗄️ Memory — سجل الجلسات\n'; }
  const section = buildSection(milestones());

  const s = doc.indexOf(START);
  const e = doc.indexOf(END);
  let next;
  if (s !== -1 && e !== -1 && e > s) {
    next = doc.slice(0, s) + section + doc.slice(e + END.length);
  } else {
    next = doc.replace(/\s*$/, '') + '\n\n---\n\n' + section + '\n';
  }

  if (next !== doc) {
    fs.writeFileSync(LOG_FILE, next);
    process.stdout.write('memory: sessions-log.md updated\n');
    return;
  }
  process.stdout.write('memory: no change\n');
}

main();
