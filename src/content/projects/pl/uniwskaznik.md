---
title: UniWskaźnik — kalibracja wskaźnika paliwa
summary: Elektronika i firmware poprawiające wskazania poziomu paliwa w starszych samochodach, także z dodatnim biegunem na masie.
kind: company
year: 2024
role: Schemat, PCB, firmware i kalibracja
stack: [C/C++, Arduino, AVR, ATmega328PB, MCP4726, I2C, EEPROM, PCB]
metric: { value: "ADC → DAC", label: "dopasowanie sygnału wskaźnika paliwa" }
order: 15
---

## Kontekst

W starszych samochodach wskaźnik paliwa może podawać nieprawidłowe odczyty lub zmieniać wskazanie podczas jazdy po nierównym terenie. UniWskaźnik powstał z myślą o takich instalacjach, w tym samochodach z dodatnim biegunem na masie i wskaźnikach bez elektronicznego wspomagania.

## Rozwiązanie

Opracowałem schemat, PCB oraz firmware układu dopasowującego sygnał do wskaźnika. Mikrokontroler odczytuje wejście analogowe przez ADC i przelicza je na sygnał wyjściowy przetwornika DAC MCP4726, sterowanego przez I²C.

Dolny i górny punkt wskazania można skalibrować przyciskami i przełącznikiem trybów. Ustawienia są zapisywane w EEPROM, dzięki czemu pozostają dostępne po wyłączeniu zasilania. Firmware uwzględnia próg zmiany sygnału, ograniczający reagowanie na drobne wahania odczytu.

## Efekt

Urządzenie sprawdzono w wielu samochodach. Poprawiło nieprawidłowe wskazania poziomu paliwa i ograniczyło ich wahania podczas jazdy po nierównym terenie.

## Moja rola

- projekt schematu i PCB,
- firmware mikrokontrolera,
- opracowanie kalibracji i zapisu ustawień.
