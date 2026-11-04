import json
import pathlib
import zipfile

root = pathlib.Path(__file__).resolve().parent.parent
base = root / "plugin-template"
manifest = json.loads((base / "plugin.json").read_text(encoding="utf-8"))
manifest["version"] = "0.2.0-lite"
manifest["description"] = "Versão Lite sem servidor remoto para pesquisas e comparações assistidas pelo ChatGPT."
path = root / "releases/comparador-compras-lite.zip"
path.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("plugin.json", json.dumps(manifest, ensure_ascii=False, indent=2))
    for folder in ("skills", "agents"):
        for file in (base / folder).rglob("*"):
            if file.is_file():
                z.write(file,file.relative_to(base))
with zipfile.ZipFile(path) as z:
    assert "plugin.json" in z.namelist()
    assert "skills/comparar-compras/SKILL.md" in z.namelist()
print(path)
