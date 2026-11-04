import json
import pathlib
import sys
import zipfile
from urllib.parse import urlparse

root = pathlib.Path(__file__).resolve().parent.parent
if len(sys.argv) != 2:
    raise SystemExit("Uso: python3 scripts/gerar-plugin.py https://SEU-SERVIDOR.vercel.app/api/mcp")
endpoint = sys.argv[1].strip()
u = urlparse(endpoint)
if u.scheme != "https" or not u.hostname or u.username or u.password or u.query or u.fragment or not u.path.endswith("/api/mcp"):
    raise SystemExit("Informe a URL HTTPS pública, terminada em /api/mcp, do seu servidor já implantado.")
manifest = json.loads((root / "plugin-template/plugin.json").read_text(encoding="utf-8"))
mcp = {"$schema":"https://agent-plugins.org/schemas/1.0.0/mcp.schema.json", "mcpServers":{"comparador":{"type":"streamable-http", "url":endpoint, "extensions":{"com.openai":{"auth":{"type":"none"}}}}}}
path = root / "dist/comparador-compras-chatgpt.zip"
path.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(path,"w",zipfile.ZIP_DEFLATED) as z:
    z.writestr("plugin.json", json.dumps(manifest,ensure_ascii=False,indent=2))
    z.writestr("mcp.json",json.dumps(mcp,ensure_ascii=False,indent=2))
    for folder in ("skills", "agents"):
        for file in (root / "plugin-template" / folder).rglob("*"):
            if file.is_file():
                z.write(file,file.relative_to(root / "plugin-template"))
with zipfile.ZipFile(path) as z:
    assert {"plugin.json","mcp.json","agents/openai.yaml","skills/comparar-compras/SKILL.md"}.issubset(z.namelist())
print(path)
