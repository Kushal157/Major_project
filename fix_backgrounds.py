import os
import glob

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
        
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

replacements = [
    ('#EDE9FF', '#090f1a'), # App.tsx background
    ('rgba(237,233,255', 'rgba(9,15,26'), # Many panels
    ('rgba(242,238,255', 'rgba(12,18,30'), # CentralPanel header
    ('rgba(255,244,228', 'rgba(14,20,32'), # CentralPanel footer
    ('rgba(255,248,240', 'rgba(14,20,32'), # LeftPanel active card
    ('rgba(255,252,248', 'rgba(14,20,32'), # LeftPanel idle card
]

for filepath in glob.glob('src/**/*.tsx', recursive=True):
    replace_in_file(filepath, replacements)
