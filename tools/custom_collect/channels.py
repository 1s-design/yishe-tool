#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""自建图片采集渠道 —— 不依赖 design-server 的 112 个内置采集源。

每个渠道只负责「发现图片直链」，产出统一结构：
    {id, url, title, keywords, source, link, filetype}
再由 direct_import.py 通过 collect.run(action=download, items=[...]) 送进素材库，
下载 / 透明裁切 / COS 上传全部在客户端完成，服务端不碰像素。

已实测可达（2026-11-07）：pokeapi.co、api.github.com、raw.githubusercontent.com、
cdn.jsdelivr.net。本地直连被拦或不可达的站点不要写进渠道。
"""
import json, os, re, time, urllib.parse, urllib.request

CACHE = '/tmp/custom_collect_trees'
os.makedirs(CACHE, exist_ok=True)
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def fetch(url, timeout=45, retries=2):
    last = None
    for i in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': '*/*'})
            with OPENER.open(req, timeout=timeout) as r:
                return r.read()
        except Exception as e:
            last = e
            if i < retries:
                time.sleep(1.5 * (i + 1))
    raise last


def fetch_json(url, timeout=45, retries=2):
    return json.loads(fetch(url, timeout, retries).decode('utf-8', 'replace'))


def raw_url(repo, branch, path):
    """GitHub 仓库内文件的 raw 直链（路径含空格需转义）。"""
    quoted = '/'.join(urllib.parse.quote(seg, safe="._-~()'") for seg in path.split('/'))
    return 'https://raw.githubusercontent.com/%s/%s/%s' % (repo, branch, quoted)


def github_tree(repo, branch='main'):
    """一次 git trees API 拿全仓库文件清单，结果缓存在 /tmp，省 GitHub 速率。"""
    key = re.sub(r'[^a-zA-Z0-9]+', '_', repo + '_' + branch)
    path = os.path.join(CACHE, key + '.json')
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        try:
            return json.load(open(path))
        except Exception:
            pass
    url = 'https://api.github.com/repos/%s/git/trees/%s?recursive=1' % (repo, branch)
    d = fetch_json(url, timeout=60)
    if not isinstance(d.get('tree'), list):
        raise RuntimeError('github tree 返回异常: %s' % str(d)[:160])
    json.dump(d, open(path, 'w'))
    return d


def tree_pngs(repo, branch='main', contains=None, prefix=None, keywords=None, limit=100):
    """从仓库树里挑 PNG，产出渠道记录。

    contains: 路径必须包含的子串（如 '/3D/'）；prefix: 路径前缀；
    keywords: 任一关键词出现在路径里（大小写不敏感）。
    """
    tree = github_tree(repo, branch)['tree']
    out = []
    for node in tree:
        p = node.get('path', '')
        if not p.lower().endswith('.png'):
            continue
        if contains and contains.lower() not in p.lower():
            continue
        if prefix and not p.startswith(prefix):
            continue
        low = p.lower()
        if keywords and not any(k.lower() in low for k in keywords):
            continue
        name = p.rsplit('/', 1)[-1][:-4]
        out.append({
            'id': re.sub(r'[^a-zA-Z0-9_-]', '_', p)[:100],
            'url': raw_url(repo, branch, p),
            'title': name.replace('_', ' ').replace('-', ' ').strip().title(),
            'keywords': '',
            'source': '',
            'link': 'https://github.com/%s/blob/%s/%s' % (repo, branch, p),
            'filetype': 'png',
        })
        if len(out) >= limit:
            break
    return out


# ── 渠道 1：PokéAPI 官方立绘（宝可梦，热门 IP，RGBA 透明 PNG）─────────
# 官方 artwork 为 475x475 左右真透明立绘，比任何第三方 PNG 站都干净、稳定、无水印。
POKE_HOT = [
    'pikachu', 'eevee', 'charizard', 'blastoise', 'venusaur', 'charmander',
    'squirtle', 'bulbasaur', 'jigglypuff', 'meowth', 'psyduck', 'gengar',
    'snorlax', 'lapras', 'mew', 'mewtwo', 'lugia', 'ho-oh', 'lucario',
    'greninja', 'sylveon', 'vaporeon', 'flareon', 'jolteon', 'espeon',
    'umbreon', 'leafeon', 'glaceon', 'rowlet', 'litten', 'popplio',
    'pichu', 'togepi', 'clefairy', 'chansey', 'ditto', 'magikarp',
    'gyarados', 'arcanine', 'dragonite', 'mimikyu', 'sobble', 'scorbunny',
    'grookey', 'wooloo', 'alcremie', 'cubone', 'marill', 'plusle', 'minun',
    'shaymin', 'jirachi', 'rayquaza', 'kyogre', 'groudon', 'dialga',
    'palkia', 'giratina', 'arceus', 'zekrom', 'reshiram', 'xerneas',
    'yveltal', 'solgaleo', 'lunala', 'zacian', 'zamazenta', 'koraidon',
    'miraidon', 'sprigatito', 'fuecoco', 'quaxly', 'togekiss', 'gardevoir',
    'blaziken', 'swampert', 'sceptile', 'garchomp', 'dragonite', 'lapras',
]
POKE_BRANCH = 'master'
POKE_REPO = 'PokeAPI/sprites'


def channel_pokeapi(names=None, shiny=False, limit=120):
    """热门宝可梦官方立绘；shiny=True 取闪光配色版本。"""
    names = names or POKE_HOT
    listing = fetch_json('https://pokeapi.co/api/v2/pokemon?limit=1400', timeout=45)
    id_by_name = {}
    for row in listing.get('results', []):
        m = re.search(r'/pokemon/(\d+)/?$', row.get('url', ''))
        if m:
            id_by_name[row['name']] = int(m.group(1))
    sub = 'shiny/' if shiny else ''
    out, seen = [], set()
    for name in names:
        pid = id_by_name.get(name.lower())
        if not pid or pid in seen:
            continue
        seen.add(pid)
        p = 'sprites/pokemon/other/official-artwork/%s%d.png' % (sub, pid)
        out.append({
            'id': 'poke-%s%d' % ('shiny-' if shiny else '', pid),
            'url': raw_url(POKE_REPO, POKE_BRANCH, p),
            'title': 'Pokemon %s official artwork%s' % (name.replace('-', ' ').title(), ' shiny' if shiny else ''),
            'keywords': 'pokemon,%s,宝可梦,官方立绘,透明PNG,马克杯印花' % name,
            'source': 'pokeapi',
            'link': 'https://github.com/%s/blob/%s/%s' % (POKE_REPO, POKE_BRANCH, p),
            'filetype': 'png',
        })
        if len(out) >= limit:
            break
    return out


# ── 渠道 2：Fluent Emoji（微软开源，256x256 RGBA，可爱 / 小孩向）─────────
FLUENT_REPO = 'microsoft/fluentui-emoji'
FLUENT_KW = [
    'dog', 'cat', 'panda', 'bear', 'rabbit', 'bunny', 'fox', 'penguin',
    'frog', 'chick', 'hatching_chick', 'koala', 'otter', 'seal', 'unicorn',
    'heart', 'star', 'sparkles', 'rainbow', 'cloud', 'moon', 'sun', 'flower',
    'cherry_blossom', 'strawberry', 'cake', 'birthday', 'ice_cream', 'donut',
    'cookie', 'candy', 'lollipop', 'bubble', 'teddy_bear', 'baby', 'dinosaur',
    't_rex', 'dragon', 'butterfly', 'mushroom', 'balloon', 'gift', 'party',
]


def channel_fluent_emoji(style='3D', keywords=None, limit=80):
    """style: 3D | Color | Flat | High Contrast。3D 最立体，适合印花。"""
    keywords = keywords or FLUENT_KW
    recs = tree_pngs(FLUENT_REPO, 'main', contains='/%s/' % style,
                     prefix='assets/', keywords=keywords, limit=limit * 3)
    # 同一 emoji 多风格时只取一张，并按关键词优先级排序保证先拿最可爱的
    seen, out = set(), []
    for kw in keywords:
        for r in recs:
            if kw.lower() not in r['url'].lower():
                continue
            key = r['url'].rsplit('/', 1)[0]
            if key in seen:
                continue
            seen.add(key)
            r = dict(r)
            r['source'] = 'fluent-emoji'
            r['keywords'] = 'kawaii,可爱,%s,fluent emoji,%s,透明PNG' % (kw.replace('_', ' '), style)
            r['title'] = r['title'] + ' (%s Fluent Emoji)' % style
            out.append(r)
            if len(out) >= limit:
                return out
    return out


# ── 渠道 3：GitHub 开源游戏 IP 素材（二次元角色头像 / 立绘）──────────────
GAME_REPOS = {
    'arknights': {
        'repo': 'yuanyan3060/ArknightsGameResource', 'branch': 'main',
        'prefixes': ['portrait/', 'avatar/'], 'label': '明日方舟',
    },
    'starrail': {
        'repo': 'Mar-7th/StarRailRes', 'branch': 'master',
        'prefixes': ['icon/character/'], 'label': '崩坏星穹铁道',
    },
}


def channel_game_assets(key='arknights', limit=60):
    cfg = GAME_REPOS[key]
    tree = github_tree(cfg['repo'], cfg['branch'])['tree']
    out = []
    for node in tree:
        p = node.get('path', '')
        if not p.lower().endswith('.png'):
            continue
        if not any(p.startswith(x) for x in cfg['prefixes']):
            continue
        name = p.rsplit('/', 1)[-1][:-4]
        out.append({
            'id': '%s-%s' % (key, re.sub(r'[^a-zA-Z0-9_-]', '_', name)[:70]),
            'url': raw_url(cfg['repo'], cfg['branch'], p),
            'title': '%s %s' % (cfg['label'], name.replace('_', ' ').title()),
            'keywords': '%s,%s,二次元,热门IP,游戏角色,透明PNG' % (cfg['label'], key),
            'source': 'github-' + key,
            'link': 'https://github.com/%s/blob/%s/%s' % (cfg['repo'], cfg['branch'], p),
            'filetype': 'png',
        })
        if len(out) >= limit:
            break
    return out


# ── 渠道 4：GitHub 高清透明角色立绘（1024~2048px，真正能上马克杯）──────
# git trees API 的 blob 带 size 字段，可先按体积筛掉低清小图，不必逐张下载探测。
# 实测：明日方舟 skin/ 1024x1024 RGBA；崩铁 character_portrait/ 2048x2048 RGBA。
GAME_HD = {
    'arknights': {
        'repo': 'yuanyan3060/ArknightsGameResource', 'branch': 'main',
        'prefixes': ['skin/'], 'label': '明日方舟',
        'min_size': 150000, 'max_size': 900000,
    },
    'starrail': {
        'repo': 'Mar-7th/StarRailRes', 'branch': 'master',
        'prefixes': ['image/character_portrait/'], 'label': '崩坏星穹铁道',
        'min_size': 0, 'max_size': 3000000,
    },
    'starrail-lc': {
        'repo': 'Mar-7th/StarRailRes', 'branch': 'master',
        'prefixes': ['image/light_cone_portrait/'], 'label': '崩铁光锥立绘',
        'min_size': 400000, 'max_size': 4000000,
    },
}


def channel_game_hd(key='arknights', limit=30):
    cfg = GAME_HD[key]
    tree = github_tree(cfg['repo'], cfg['branch'])['tree']
    cand = []
    for node in tree:
        p = node.get('path', '')
        size = int(node.get('size') or 0)
        if not p.lower().endswith('.png'):
            continue
        if not any(p.startswith(x) for x in cfg['prefixes']):
            continue
        if not (cfg['min_size'] <= size <= cfg['max_size']):
            continue
        cand.append((size, p))
    # 体积小的先采：同尺寸画质接近，下载更快、不拖慢整批
    cand.sort()
    out = []
    for size, p in cand[:limit]:
        name = p.rsplit('/', 1)[-1][:-4]
        out.append({
            'id': 'hd-%s-%s' % (key, re.sub(r'[^a-zA-Z0-9_-]', '_', name)[:70]),
            'url': raw_url(cfg['repo'], cfg['branch'], p),
            'title': '%s %s HD 透明立绘' % (cfg['label'], name.replace('_', ' ')[:36]),
            'keywords': '%s,%s,二次元,热门IP,高清透明立绘,马克杯印花' % (cfg['label'], key),
            'source': 'github-hd-' + key,
            'link': 'https://github.com/%s/blob/%s/%s' % (cfg['repo'], cfg['branch'], p),
            'filetype': 'png',
        })
    return out


# ── 渠道 5：任意 URL 清单（人工 / 其它爬虫产出）────────────────────────
def channel_url_list(path):
    recs = json.load(open(path)) if path.endswith('.json') else [
        {'url': l.strip()} for l in open(path) if l.strip() and not l.startswith('#')]
    for i, r in enumerate(recs):
        r.setdefault('id', 'url-%d' % i)
        r.setdefault('title', r['id'])
        r.setdefault('keywords', '')
        r.setdefault('source', 'custom-url')
        r.setdefault('link', r['url'])
        r.setdefault('filetype', r['url'].split('?')[0].rsplit('.', 1)[-1] or 'png')
    return recs


CHANNELS = {
    'pokeapi': lambda **kw: channel_pokeapi(**kw),
    'pokeapi-shiny': lambda **kw: channel_pokeapi(shiny=True, **kw),
    'fluent-emoji': lambda **kw: channel_fluent_emoji(**kw),
    'arknights': lambda **kw: channel_game_assets('arknights', **kw),
    'starrail': lambda **kw: channel_game_assets('starrail', **kw),
    'arknights-hd': lambda **kw: channel_game_hd('arknights', **kw),
    'starrail-hd': lambda **kw: channel_game_hd('starrail', **kw),
    'starrail-lc': lambda **kw: channel_game_hd('starrail-lc', **kw),
}
