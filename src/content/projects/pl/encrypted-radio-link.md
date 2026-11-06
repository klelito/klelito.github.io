---
title: Szyfrowane sterowanie radiowe pilot–odbiornik
summary: Własny projekt nadajnika i połączenia radiowego z układami HCS firmy Microchip (KeeLoq), zabezpieczający komendy sterujące między pilotem a odbiornikiem.
kind: own
year: 2024
role: Samodzielne opracowanie połączenia i nadajnika
stack: [Microchip HCS, KeeLoq, RF, Elektronika, Projekt nadajnika]
metric: { value: "KeeLoq", label: "kod zmienny komend pilot–odbiornik" }
order: 17
---

## Kontekst

Celem projektu było zabezpieczenie sterowania radiowego między pilotem a odbiornikiem. Sygnał radiowy można odebrać, dlatego istotne było, żeby przechwyconej komendy nie dało się wykorzystać do ponownego uruchomienia urządzenia.

## Rozwiązanie

Samodzielnie opracowałem połączenie radiowe, w tym własny projekt nadajnika. Do zabezpieczenia komend wykorzystałem układy z rodziny HCS firmy Microchip, które szyfrują polecenia algorytmem KeeLoq z kodem zmiennym.

Zadanie obejmowało elektronikę nadajnika oraz sposób przekazywania komend do odbiornika. Kod zmienny nie ukrywa samej transmisji, ale ogranicza ponowne wykorzystanie odebranych poleceń sterujących.

## Efekt

Powstał własny projekt sterowania radiowego oparty na kodowaniu HCS (KeeLoq), łączący opracowanie nadajnika z zabezpieczeniem przesyłanych komend.

## Moja rola

- samodzielne opracowanie projektu,
- własny projekt nadajnika,
- zastosowanie układów HCS do zabezpieczenia komend sterujących.
