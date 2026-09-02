# -*- coding: utf-8 -*-
"""Checks the three copy rules: no em dashes, American spellings, no prose semicolons."""
import io, os, re, sys

EM = '—'
EN = '–'

BRIT = re.compile(r"""\b(
 colour\w*|behaviour\w*|favour\w*|honour\w*|neighbour\w*|
 recognis\w+|organis\w+|harmonis\w+|utilis\w+|minimis\w+|maximis\w+|normalis\w+|
 initialis\w+|visualis\w+|optimis\w+|prioritis\w+|summaris\w+|emphasis(?:e|ed|ing)\b|
 specialis\w+|characteris\w+|analys(?:e|ed|ing)\b|standardis\w+|categoris\w+|
 customis\w+|localis\w+|realis(?:e|ed|ing)\b|apologis\w+|
 modelling|labelled|cancelled|travelled|fulfil\b|enrol\b|whilst|amongst|
 grey\b|centre\b|metre\b|licence\b|defence\b|programme\b|practise\b|artefact\w*
)\b""", re.I | re.X)

# A semicolon in prose, not a for-loop or a TS type member.
CODE_SEMI = re.compile(r'''(
 for\s*\(|                       # for loops
 ^\s*(import|export|const|let|var|return|type|interface)\b|
 \{\s*\w+\s*:\s*\w|             # inline type literals { a: string; b: number }
 \}\s*\[\]|
 ;\s*$                           # trailing statement semicolons
)''', re.X)
PROSE_SEMI = re.compile(r'[A-Za-z0-9)\]"’]\s*;\s+[a-z]')
ENTITY = re.compile(r'&[a-zA-Z]+;|&#\d+;')

files = []
for root, dirs, fs in os.walk('src'):
    dirs[:] = [d for d in dirs if d != 'node_modules']
    files += [os.path.join(root, f) for f in fs]
files += ['README.md', 'index.html']

problems = 0
for path in files:
    try:
        s = io.open(path, encoding='utf-8').read()
    except Exception:
        continue
    for i, line in enumerate(s.split('\n'), 1):
        if EM in line or '&mdash;' in line or EN in line or '&ndash;' in line:
            print('EMDASH   %s:%d  %s' % (path, i, line.strip()[:95])); problems += 1
        m = BRIT.search(line)
        if m:
            print('BRITISH  %s:%d  %r  %s' % (path, i, m.group(0), line.strip()[:70])); problems += 1
        stripped = ENTITY.sub('', line)
        if PROSE_SEMI.search(stripped) and not CODE_SEMI.search(stripped):
            print('SEMI     %s:%d  %s' % (path, i, line.strip()[:95])); problems += 1

print('\n%d problem(s)' % problems)
sys.exit(1 if problems else 0)
