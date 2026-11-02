---
title: Asystent przesunięć magazynowych ze skanerem
summary: Aplikacja Windows, która odczytuje etykiety DataMatrix ze skanera i prowadzi magazyniera przez przesunięcie MM w SAP Business One — bez zapisu do bazy.
kind: company
year: 2026
role: Projekt i implementacja
stack: [C#, .NET, SAP Business One, DataMatrix, USB CDC]
metric: { value: "0", label: "zapisów w bazie SAP — wyłącznie odczyt" }
featured: true
order: 3
---

## Kontekst

Magazyn rejestruje przesunięcia międzymagazynowe (MM) w SAP Business One na podstawie etykiet DataMatrix na opakowaniach komponentów.

## Problem

Ręczne przepisywanie indeksów i ilości z etykiet jest wolne i podatne na błędy, a to samo opakowanie można zeskanować dwa razy.

## Rozwiązanie

Samodzielna aplikacja Windows x64 odbiera etykiety ze skanera USB (port COM), odczytuje kartotekę towaru parametryzowanym zapytaniem, przelicza ilość według reguły dla jednostki magazynowej i wprowadza dane do okna SAP, symulując klawiaturę. Unikalny identyfikator etykiety chroni przed podwójnym skanem, a aplikacja sama proponuje podpisane aktualizacje.

## Efekt

Program nie zapisuje niczego w bazie SAP i nie zatwierdza dokumentów: magazynier zachowuje kontrolę, a dane trafiają do dokumentu bez przepisywania.

## Moja rola

- projekt i implementacja aplikacji,
- reguły przeliczania jednostek i ochrona przed podwójnym skanem,
- instrukcje dla magazyniera i administratora.
