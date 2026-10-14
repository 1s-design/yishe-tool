import os, sys
# 用法: python3 tools/launch-production.py <target> <chunk> <variants> <sizeSpec> [category]
repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:] or ["2000", "4", "2", ""]
pid = os.fork()
if pid > 0:
    print(f"launched pid={pid}"); sys.exit(0)
os.setsid()
if os.fork() > 0: sys.exit(0)
os.chdir(repo)
out = open("/tmp/inspiration-produce.out", "a")
os.dup2(out.fileno(), 1); os.dup2(out.fileno(), 2)
dn = open("/dev/null"); os.dup2(dn.fileno(), 0)
open("/tmp/inspiration-produce.pid", "w").write(str(os.getpid()))
os.execvp("node", ["node", "tools/run-inspiration-produce.mjs", *args])
