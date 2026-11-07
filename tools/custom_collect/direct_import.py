#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""自建渠道 → 素材库 的通用入库器。

用 collect.run(action="download", items=[...]) 直传任意图片 URL，
复用客户端 download.toCos：下载 → 透明边距自动裁切 → COS 上传 → 入库。
服务端只做调度与记录，不处理像素。

用法：
  python3 direct_import.py urls.json [connectionId]
  python3 direct_import.py urls.json --workers 2 --batch 5
"""
import json, os, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = os.path.dirname(os.path.abspath(__file__))
TOKEN = open('/Users/jackie/workspace/1s/tools/.test-token').read().strip()
URL = 'http://127.0.0.1:1520/api/ai-assistant/tools/execute'
OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))
SEEN = os.path.join(BASE, 'imported_urls.jsonl')
RESULT = '/tmp/custom_collect_results.jsonl'
# 默认取全部在线客户端；可用 COLLECT_CIDS 环境变量指定单连接（多任务并行时分流）
DEFAULT_CIDS = (os.environ.get('COLLECT_CIDS') or
                '808db44a-0c11-433d-b074-3d8a17fee361,'
                '50af073b-b4aa-46f9-a7e6-c86669fc4f7f').split(',')
# 载体源：任意带 download(write) 方法的源；其 download hook 已支持 item 级
# source / keywords / referer / headers 透传（openverse.ts）。
CARRIER = os.environ.get('CARRIER', 'openverse')


def tool_result(d):
    data = d.get('data')
    msgs = data.get('messages', []) if isinstance(data, dict) else (data or [])
    for m in reversed(msgs):
        if m.get('role') == 'tool' and isinstance(m.get('toolResult'), dict):
            return m['toolResult']
    return {}


def healthy():
    try:
        req = urllib.request.Request(
            'http://127.0.0.1:1520/api/websocket/my-online-runtime-connection-views',
            data=b'{}', headers={'Authorization': 'Bearer ' + TOKEN,
                                 'Content-Type': 'application/json'})
        with OPENER.open(req, timeout=8) as r:
            return r.status in (200, 201)
    except Exception:
        return False


def wait_healthy(max_wait=240):
    waited = 0
    while not healthy() and waited < max_wait:
        time.sleep(20)
        waited += 20
    return healthy()


def load_seen():
    out = set()
    if os.path.exists(SEEN):
        for line in open(SEEN, encoding='utf-8'):
            try:
                out.add(json.loads(line)['url'])
            except Exception:
                pass
    return out


def to_item(rec, i):
    u = rec['url']
    return {
        'id': rec.get('id') or ('custom-%d-%d' % (int(time.time()), i)),
        'title': rec.get('title') or 'custom image',
        'downloadUrl': u,
        'image': u,
        'url': u,
        'link': rec.get('link') or u,
        'filetype': rec.get('filetype') or (u.split('?')[0].rsplit('.', 1)[-1] or 'png'),
        'source': rec.get('source') or 'custom-channel',
        'keywords': rec.get('keywords') or '',
        'tags': rec.get('keywords') or '',
        'width': rec.get('width'),
        'height': rec.get('height'),
        **({'referer': rec['referer']} if rec.get('referer') else {}),
        **({'headers': rec['headers']} if rec.get('headers') else {}),
        **({'meta': rec['meta']} if rec.get('meta') else {}),
    }


def call(items, cid, timeout=180):
    inp = {'sourceId': CARRIER, 'action': 'download', 'items': items,
           'connectionId': cid, 'concurrency': 4}
    body = json.dumps({'tool': 'collect.run', 'input': inp, 'confirmed': True},
                      ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(URL, data=body, headers={
        'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json'})
    with OPENER.open(req, timeout=timeout) as r:
        d = json.loads(r.read().decode('utf-8', 'replace'))
    tr = tool_result(d)
    return tr.get('data') if isinstance(tr.get('data'), dict) else tr


def import_records(records, cids=None, workers=None, batch=5, skip_seen=True):
    cids = cids or DEFAULT_CIDS
    workers = workers or len(cids)
    if skip_seen:
        seen = load_seen()
        records = [r for r in records if r['url'] not in seen]
    batches = [records[i:i + batch] for i in range(0, len(records), batch)]
    print('导入 %d 张 / %d 批 / %d 通道 / 载体源 %s' % (
        len(records), len(batches), workers, CARRIER), flush=True)
    ok_total, saved_total, out = 0, 0, []

    def work(args):
        idx, group = args
        cid = cids[idx % workers]
        items = [to_item(r, j) for j, r in enumerate(group)]
        t0 = time.time()
        if not wait_healthy():
            return {'batch': idx, 'ok': False, 'error': 'service down', 'items': items}
        try:
            data = call(items, cid)
            ok = data.get('success', True) is not False
            rows = data.get('items') or []
            saved = sum(1 for x in rows if isinstance(x, dict) and x.get('materialOk'))
            if saved == 0 and ok:
                saved = int(data.get('downloaded') or 0)
            print('[%02d] %s saved=%d/%d %.1fs %s' % (
                idx, 'OK ' if ok else 'FAIL', saved, len(items), time.time() - t0,
                str(data.get('error') or '')[:70]), flush=True)
            return {'batch': idx, 'ok': ok, 'saved': saved, 'items': items, 'data': data}
        except Exception as e:
            print('[%02d] FAIL %s %.1fs' % (idx, str(e)[:90], time.time() - t0), flush=True)
            return {'batch': idx, 'ok': False, 'error': str(e), 'items': items}

    with ThreadPoolExecutor(max_workers=workers) as ex:
        for r in ex.map(work, enumerate(batches)):
            out.append(r)
            ok_total += 1 if r['ok'] else 0
            saved_total += r.get('saved', 0)
            if r['ok']:
                with open(SEEN, 'a', encoding='utf-8') as f:
                    for it in r['items']:
                        f.write(json.dumps({'url': it['downloadUrl'],
                                            'source': it['source'],
                                            'ts': time.strftime('%Y-%m-%dT%H:%M:%S')},
                                           ensure_ascii=False) + '\n')
    with open(RESULT, 'a', encoding='utf-8') as f:
        for r in out:
            f.write(json.dumps(r, ensure_ascii=False)[:8000] + '\n')
    print('DONE 成功批=%d/%d 入库≈%d 张' % (ok_total, len(out), saved_total), flush=True)
    return out


if __name__ == '__main__':
    path = sys.argv[1]
    recs = json.load(open(path))
    positional = [a for a in sys.argv[2:] if not a.startswith('--')]
    cids = [positional[0]] if positional else None
    w = int(os.environ.get('WORKERS', '0')) or None
    b = int(os.environ.get('BATCH', '5'))
    import_records(recs, cids=cids, workers=w, batch=b)
