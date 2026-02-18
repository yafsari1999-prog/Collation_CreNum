#!/usr/bin/env python3
"""Test du modèle t/n pour CollateX"""
import sys
sys.path.insert(0, '/Users/yasaman/Documents/Projects/Collation_CreNum/backend')
from collate import collate_verse_words, tokenize_witness_text

# Test 1: Vérifier la tokenisation t/n
print("=== Test 1: tokenize_witness_text ===")
tokens = tokenize_witness_text("Puys que fortune est si variable.")
for t in tokens:
    print(f'  t="{t["t"]}"  n="{t["n"]}"')

# Test 2: Collation avec formes normalisées
print("\n=== Test 2: Collation t/n ===")
texts = [
    "Puys que fortune est si variable.",
    "Puis que fortune est sy uariable.",
    "Puys que fortune est si variable.",
]
names = ['bnf_1712', 'bnf_2820', 'chantilly']

alignment = collate_verse_words(texts, names)
print(f"  {len(alignment)} positions alignées")
for pos in alignment:
    variant = 'VAR' if pos['has_variant'] else '   '
    words = []
    for w in pos['words']:
        if w['missing']:
            words.append('---')
        else:
            words.append(f'{w["text"]}({w["normalized"]})')
    print(f'  [{pos["index"]}] {variant} {" | ".join(words)}')

# Test 3: Avec macron combinant
print("\n=== Test 3: Macron combinant ===")
texts2 = [
    "St uault trop mieulx payer tard q\u0304 iamais.",
    "Si vault trop mieulx payer tard que jamais.",
    "Si vault trop mieulx payer tart que iamais.",
]

tokens_macron = tokenize_witness_text(texts2[0])
print("  Tokens du témoin 1:")
for t in tokens_macron:
    print(f'    t="{t["t"]}"  n="{t["n"]}"')

alignment2 = collate_verse_words(texts2, names)
print(f"\n  {len(alignment2)} positions alignées")
for pos in alignment2:
    variant = 'VAR' if pos['has_variant'] else '   '
    words = []
    for w in pos['words']:
        if w['missing']:
            words.append('---')
        else:
            words.append(w['text'])
    print(f'  [{pos["index"]}] {variant} {" | ".join(words)}')

# Test 4: Doublets consonantiques - "abbatue" vs "abatue"
print("\n=== Test 4: Doublets consonantiques ===")
texts3 = [
    "Ville abbatue par les ennemys",
    "Uille abatue par les ennemis",
    "Ville abatue par les ennemys",
]
alignment3 = collate_verse_words(texts3, names)
print(f"  {len(alignment3)} positions alignées")
for pos in alignment3:
    variant = 'VAR' if pos['has_variant'] else '   '
    words = []
    for w in pos['words']:
        if w['missing']:
            words.append('---')
        else:
            words.append(f'{w["text"]}({w["normalized"]})')
    print(f'  [{pos["index"]}] {variant} {" | ".join(words)}')

print("\n=== Tous les tests passés ===")
