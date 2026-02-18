#!/usr/bin/env python3
"""Test script for macron handling"""
import re
import unicodedata
from collatex import Collation, collate
import json

# Test 1: How CollateX tokenizes words with combining macron
print("=== Test 1: CollateX avec macron combinant ===")
c = Collation()
c.add_plain_witness('A', 'tard q\u0304 iamais')
c.add_plain_witness('B', 'tard que jamais')
result = collate(c, output='json', segmentation=False)
alignment = json.loads(result) if isinstance(result, str) else result
table = alignment.get('table', [])
for wit_idx, row in enumerate(table):
    print(f'Witness {wit_idx}:')
    for col_idx, cell in enumerate(row):
        tokens = [t.get('t','') for t in cell] if cell else ['_']
        print(f'  [{col_idx}] {tokens}')

# Test 2: Regex pattern - does it affect macron?
print("\n=== Test 2: Regex pattern ===")
pattern = r'[/.,;:!\?\-\u2013\u2014\'\"()\[\]{}\u2026\u00B7*\u00B0\u2E2B\u204A\u00B6\u00A7\u2020\u2021\u2E1D\u2E1E\u2039\u203A\u00AB\u00BB\u201E\u201C\u201D\u2018\u2019\u201B\u201F\u2E17]'

test_words = ['mesme\u0304t', 'h\u014Dme', 'q\u0304', 'tesmo\u012Bgs']
for w in test_words:
    result = re.sub(pattern, '', w)
    print(f'  {w!r} -> {result!r}  (same: {w == result})')

# Test 3: Does lettres doubles regex break macron?
print("\n=== Test 3: Lettres doubles regex avec macron ===")
for w in test_words:
    result = re.sub(r'(.)\1', r'\1', w)
    print(f'  {w!r} -> {result!r}  (same: {w == result})')

# Test 4: Full normalize
print("\n=== Test 4: Full normalize ===")
for w in test_words:
    text = re.sub(pattern, '', w)
    text = text.lower()
    text = re.sub(r'(.)\1', r'\1', text)
    text = text.replace('y', 'i')
    print(f'  {w} -> {text}')

# Test 5: prepare_text_for_collation
print("\n=== Test 5: prepare_text_for_collation ===")
test_line = 'Touchant ses faictz deux ou troys b\u014Ds tesmo\u012Bgs.'
result = re.sub(pattern, ' ', test_line)
result = re.sub(r'\s+', ' ', result).strip()
print(f'  Input:  {test_line}')
print(f'  Output: {result}')

test_line2 = 'St uault trop mieulx payer tard q\u0304 iamais.'
result2 = re.sub(pattern, ' ', test_line2)
result2 = re.sub(r'\s+', ' ', result2).strip()
print(f'  Input:  {test_line2}')
print(f'  Output: {result2}')

# Test 6: CollateX tokenization with combining macron
print("\n=== Test 6: CollateX tokenization q + combining macron ===")
c2 = Collation()
# q followed by combining macron - is it one token or two?
c2.add_plain_witness('A', 'payer tard q\u0304 iamais')
result2 = collate(c2, output='json', segmentation=False)
alignment2 = json.loads(result2) if isinstance(result2, str) else result2
table2 = alignment2.get('table', [])
for wit_idx, row in enumerate(table2):
    print(f'Witness {wit_idx}:')
    for col_idx, cell in enumerate(row):
        if cell:
            for t in cell:
                raw = t.get('t', '')
                print(f'  [{col_idx}] "{raw}" chars: {[hex(ord(c)) for c in raw]}')
        else:
            print(f'  [{col_idx}] _')
