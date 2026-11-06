---
title: K-GST — sterowanie podnośnikiem TV gestami
summary: Akcesorium do obsługi podnośnika TV ruchem dłoni — od schematu i PCB, przez firmware i obudowę, po testy i wprowadzenie do sprzedaży.
kind: company
year: 2024
role: Schemat, PCB, firmware, obudowa i testy
stack: [C/C++, Arduino, ATtiny3224, PAJ7620U2, I2C, PCB]
metric: { value: "W sprzedaży", label: "akcesorium sterowane gestami" }
results:
  - { value: "2 / 4", label: "kanały sterowania w dwóch wersjach" }
  - { value: "W sprzedaży", label: "urządzenie dostępne dla użytkowników" }
order: 16
---

## Kontekst

K-GST rozszerza obsługę podnośnika TV o gesty dłoni. Akcesorium przekłada rozpoznany ruch na komendę sterującą podnośnikiem i potwierdza ją sygnalizacją LED.

## Rozwiązanie

Opracowałem schemat elektroniki, PCB, firmware, obudowę oraz testy urządzenia. Mikrokontroler ATtiny3224 odczytuje gesty z czujnika PAJ7620U2 przez I²C i przypisuje je do odpowiednich wyjść sterujących.

Firmware określa czas trwania sygnału oraz sposób rozjaśniania i wygaszania diod. Przygotowałem wersje obsługujące 2 lub 4 kanały sterowania.

## Efekt

Urządzenie weszło do sprzedaży. Projekt objął zarówno elektronikę i oprogramowanie wbudowane, jak i fizyczną postać akcesorium oraz jego sprawdzenie w testach.

## Moja rola

- projekt schematu i PCB,
- firmware w wersjach 2- i 4-kanałowej,
- opracowanie obudowy,
- przygotowanie i wykonanie testów.
