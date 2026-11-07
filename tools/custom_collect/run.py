#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""自建渠道采集编排器。

示例：
  python3 run.py --channels pokeapi,fluent-emoji --limit 60 --dry-run
  python3 run.py --channels pokeapi,fluent-emoji,arknights --limit 80
  python3 run.py --urls /tmp/my_urls.json
"""
import argparse, json, os, sys, time
BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

import channels
from direct_import import import_records


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--channels', default='pokeapi,fluent-emoji',
                    help='逗号分隔，见 channels.CHANNELS')
    ap.add_argument('--limit', type=int, default=60, help='每个渠道最多取多少张')
    ap.add_argument('--urls', help='额外 URL 清单（json 或每行一个 URL）')
    ap.add_argument('--out', default='/tmp/custom_collect_urls.json', help='导出待导入清单')
    ap.add_argument('--dry-run', action='store_true', help='只发现不入库')
    ap.add_argument('--workers', type=int, default=0)
    ap.add_argument('--batch', type=int, default=5)
    ap.add_argument('--no-skip-seen', action='store_true')
    a = ap.parse_args()

    all_recs, report = [], []
    for name in a.channels.split(','):
        name = name.strip()
        if not name:
            continue
        fn = channels.CHANNELS.get(name)
        if not fn:
            print('未知渠道', name, '可选:', ','.join(channels.CHANNELS), file=sys.stderr)
            continue
        t0 = time.time()
        try:
            try:
                recs = fn(limit=a.limit)
            except TypeError:
                recs = fn()
        except Exception as e:
            print('渠道 %-14s 失败，跳过：%s' % (name, str(e)[:110]), flush=True)
            report.append((name, -1))
            continue
        recs = recs[:a.limit]
        print('渠道 %-14s 发现 %3d 张 %.1fs' % (name, len(recs), time.time() - t0), flush=True)
        report.append((name, len(recs)))
        all_recs += recs

    if a.urls:
        extra = channels.channel_url_list(a.urls)
        print('渠道 %-14s 发现 %3d 张' % ('custom-url', len(extra)), flush=True)
        all_recs += extra
        report.append(('custom-url', len(extra)))

    # 本批内按 URL 去重
    seen, uniq = set(), []
    for r in all_recs:
        if r['url'] in seen:
            continue
        seen.add(r['url'])
        uniq.append(r)
    json.dump(uniq, open(a.out, 'w'), ensure_ascii=False, indent=1)
    print('合计 %d 张（去重后），清单 %s' % (len(uniq), a.out), flush=True)
    if a.dry_run:
        for r in uniq[:5]:
            print('  ', r['source'], '|', r['title'][:48], '|', r['url'][:90])
        return
    import_records(uniq, workers=a.workers or None, batch=a.batch,
                   skip_seen=not a.no_skip_seen)


if __name__ == '__main__':
    main()
