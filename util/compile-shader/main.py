import os
import time
import subprocess

names = ["shader.vert", "shader.frag"]

cwd = os.getcwd()
cachedir = os.path.dirname(__file__) + "/cache/"

if not os.path.exists(cachedir):
    os.mkdir(cachedir)

for name in names:
    file = cwd + "/src/shader/" + name
    cache = cachedir + "." + name

    file = file.replace("\\", "/")
    cache = cache.replace("\\", "/")

    if not os.path.exists(file):
        raise FileNotFoundError(file + " not found.")

    if os.path.exists(cache):
        curr = os.path.getmtime(file)
        last = os.path.getmtime(cache)
        if curr <= last:
            continue

    with open(cache, "w"): pass

    subprocess.run(["glslc", "-o", file + ".spv", file])
