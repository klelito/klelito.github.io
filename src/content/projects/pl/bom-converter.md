---
title: Konwerter BOM
summary: Normalizuje listy materiałowe od klientów i automatycznie dopasowuje MPN do kartoteki ERP.
kind: company
year: 2024
duration: 4 miesiące
role: Projekt, implementacja, wdrożenie
stack: [Python, FastAPI, MS SQL, Docker]
metric: { value: "−70%", label: czasu wyceny }
results:
  - { value: "−70%", label: czas przygotowania wyceny }
  - { value: "95%", label: automatycznych dopasowań MPN }
  - { value: "2 000+", label: pozycji BOM tygodniowo }
featured: true
order: 1
diagram: /diagrams/bom-converter.pl.svg
---

## Kontekst

Dział ofertowania w firmie produkującej elektronikę na zlecenie otrzymuje od klientów listy materiałowe w dziesiątkach formatów.

## Problem

Ręczne przepisywanie i szukanie odpowiedników w kartotece zajmowało do kilku godzin na jedną wycenę i generowało błędy.

- każdy klient przysyła BOM w innym układzie kolumn,
- numery producenta (MPN) są zapisywane niejednolicie,
- dopasowanie do indeksów magazynowych wymagało ręcznego przeszukiwania kartoteki.

## Rozwiązanie

Narzędzie wczytuje plik klienta, normalizuje kolumny i wartości, a następnie dopasowuje każdą pozycję do kartoteki ERP — najpierw po dokładnym MPN, potem po parametrach. Wynikiem jest raport gotowy do wyceny z oznaczeniem pozycji wymagających decyzji człowieka.

## Efekt

Przygotowanie wyceny skróciło się z 3–4 godzin do około godziny, a 95% pozycji jest dopasowywanych automatycznie.

## Moja rola

- analiza procesu ofertowania razem z działem handlowym,
- projekt i implementacja całego narzędzia,
- wdrożenie w kontenerach Docker i wsparcie użytkowników.
