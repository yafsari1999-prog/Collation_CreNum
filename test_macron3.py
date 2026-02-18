#!/usr/bin/env python3
"""Test final macron handling"""
import sys
sys.path.insert(0, '/Users/yasaman/Documents/Projects/Collation_CreNum/backend')
from collate import collate_verse_words, prepare_text_for_collation, normalize_text

# Test 1: prepare_text_for_collation strips combining marks
print("=== Test 1: prepare_text_for_collation ===")
tests = [
    'St uault trop mieulx payer tard q\u0304 iamais.',
    'Touchant ses faictz deux ou troys b\u014Ds tesmo\u012Bgs.',
    'Ueu mesmem\u0113t que est pesante lasomme.',
]
for t in tests:
    prepared = prepare_text_for_collation(t)
    print(f'  IN:  {t}')
    print(f'  OUT: {prepared}')
    print()

# Test 2: Full collation with macron
print("=== Test 2: Full collation ===")
texts = [
    'St uault trop mieulx payer tard q\u0304 iamais.',
    'Si vault trop mieulx payer tard que jamais.',
    'Si vault trop mieulx payer tart que iamais.',
]
names = ['bnf_1712', 'bnf_2820', 'chantilly']

alignment = collate_verse_words(texts, names)
print(f'  {len(alignment)} positions')
for pos in alignment:
    variant = 'VAR' if pos['has_variant'] else '   '
    words = []
    for w in pos['words']:
        if w['missing']:
            words.append('---')
        else:
            words.append(w['text'])
    print(f'  [{pos["index"]}] {variant} {" | ".join(words)}')
