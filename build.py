import os
import time
import shutil
import subprocess

rtd = os.path.dirname(__file__).replace("\\", "/")
chd = (os.path.dirname(__file__) + "/.cache/").replace("\\", "/")
tgd = (os.path.dirname(__file__) + "/build/").replace("\\", "/")

if not os.path.exists(chd):
    os.mkdir(chd)

if not os.path.exists(tgd):
    os.mkdir(tgd)

def filepath(path):
    return rtd + path

def cachepath(path):
    return chd + (path.replace("/", ".")) + ".cache"

def exists(path):
    if not os.path.exists(path):
        raise FileNotFoundError(path + " not found.")

def should(fp, cp):
    if not os.path.exists(cp):
        return True
    curr = os.path.getmtime(fp)
    last = os.path.getmtime(cp)
    if curr > last:
        return True
    return False

def run(command, cps):
    if subprocess.run(command).returncode != 0:
        for cp in cps:
            os.remove(cp)
        exit(1)

# shader.frag
path = "/pkgs/lib/shader/shader.frag"
fp = filepath(path)
cp = cachepath(path)
exists(fp)
if should(fp, cp):
    with open(cp, "w"): pass
    run(["glslc", "-o", fp + ".spv", fp], [cp])

# shader.vert
path = "/pkgs/lib/shader/shader.vert"
fp = filepath(path)
cp = cachepath(path)
exists(fp)
if should(fp, cp):
    with open(cp, "w"): pass
    run(["glslc", "-o", fp + ".spv", fp], [cp])

# zig
os.chdir(filepath("/pkgs/lib/"))
run(["zig", "build", "-Doptimize=ReleaseFast"], [])
os.chdir(rtd)
shutil.copy(filepath("/pkgs/lib/zig-out/bin/abplib.dll"), tgd + "/abplib.dll")

# c#
os.chdir(filepath("/pkgs/exe/"))
run(["dotnet", "publish", "-c", "Release", "-o", tgd], [])
os.chdir(rtd)
