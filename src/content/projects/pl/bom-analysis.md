---
title: Analiza BOM do wycen produkcji
summary: Aplikacja, która importuje listy materiałowe klientów, rozpoznaje kolumny i dopasowuje MPN do kartoteki SAP Business One — w trybie tylko do odczytu.
kind: company
year: 2026
role: Projekt i implementacja
stack: [Python, PostgreSQL, MS SQL, SAP Business One, Docker]
metric: { value: "MPN", label: "dopasowanie do kartoteki SAP (tylko odczyt)" }
featured: true
order: 2
---

## Kontekst

Dział ofertowania w firmie produkującej elektronikę przygotowuje wyceny na podstawie list materiałowych (BOM) przysyłanych przez klientów w różnych formatach.

## Problem

Każdy plik ma inny układ kolumn, a każdą pozycję trzeba odszukać w kartotece ERP razem ze stanami i historią zakupów.

## Rozwiązanie

Aplikacja importuje pliki XLSX, XLS i CSV, rozpoznaje kolumny, dopasowuje numery producenta (MPN) do kartoteki SAP Business One, pokazuje stany i ostatnie zakupy, zapisuje analizy w PostgreSQL i generuje raporty XLSX oraz CSV. Z bazą SAP łączy się wyłącznie do odczytu, a do testów ma tryb symulowanego SAP.

## Efekt

Wersja MVP obejmuje pełną ścieżkę od pliku klienta do raportu do wyceny — bez AI i bez zapisu do systemu ERP.

## Moja rola

- architektura i integracja z SAP Business One (SQL Server, tylko odczyt),
- import, dopasowanie MPN i raporty,
- dokumentacja i wydania.
