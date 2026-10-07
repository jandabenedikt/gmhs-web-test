#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NAHRAZENO souborem build.py (7. 10. 2026).

Obsah stránek je teď v _obsah/, kostra a hlavičky v _sablony/ a celý web
vyrábí „python build.py“. Tento soubor zůstává jen kvůli zvyku — spustí
build.py, aby postup pro Aktuality („python3 generate_pages.py“) fungoval dál.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
print("Pozn.: generate_pages.py je nahrazený souborem build.py — spouštím build.py.")
from build import main  # noqa: E402

sys.exit(main())
