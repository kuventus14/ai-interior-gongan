from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
shutil.copytree(root/'public',root/'dist',dirs_exist_ok=True)
print('Static build ready in dist/')
