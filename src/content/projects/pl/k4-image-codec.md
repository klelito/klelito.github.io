---
title: Kodek obrazu K4 (Median Cut)
summary: Projekt z grafiki komputerowej — redukcja palety barw algorytmem Median Cut i własny format pliku obrazu z zapisem 4- i 8-bitowym.
kind: own
year: 2026
role: Projekt akademicki — implementacja
stack: [C++, SDL, CMake]
metric: { value: "4/8-bit", label: "własny format pliku obrazu" }
links:
  repo: https://github.com/klelito/GK_Projekt-master
order: 9
---

## Kontekst

Projekt na zajęcia z grafiki komputerowej na Politechnice Krakowskiej.

## Rozwiązanie

Program w C++ z biblioteką SDL wyznacza zredukowaną paletę barw algorytmem Median Cut (także w wersji w skali szarości), dopasowuje piksele do najbliższego koloru palety i zapisuje obraz we własnym formacie K4 w wariantach 4- i 8-bitowych, z opisaną specyfikacją formatu.

## Moja rola

- implementacja kwantyzacji Median Cut i operacji na pikselach,
- zapis i odczyt formatu K4.
