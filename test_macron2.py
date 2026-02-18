#!/usr/bin/env python3
"""Test NFC normalization for macron"""
import unicodedata
from collatex import Collation, collate
import json

# Test: does NFC fix q + combining macron?
text = 'tard q\u0304 iamais'
nfc = unicodedata.normalize('NFC', text)
print(f'Original: {text!r}')
print(f'NFC:      {nfc!r}')
print(f'Same: {text == nfc}')

# Check each char
for i, c in enumerate(nfc):
    print(f'  [{i}] U+{ord(c):04X} {unicodedata.name(c, "?")} cat={unicodedata.category(c)}')

# Test CollateX with NFC
print('\n=== CollateX with NFC ===')
c = Collation()
c.add_plain_witness('A', nfc)
c.add_plain_witness('B', 'tard que jamais')
result = collate(c, output='json', segmentation=False)
alignment = json.loads(result) if isinstance(result, str) else result
table = alignment.get('table', [])
for wit_idx, row in enumerate(table):
    print(f'Witness {wit_idx}:')
    for col_idx, cell in enumerate(row):
        tokens = [t.get('t','') for t in cell] if cell else ['_']
        print(f'  [{col_idx}] {tokens}')
