---
title: Platforma działu technicznego i logistyki
summary: Wewnętrzna aplikacja webowa do zarządzania zadaniami działu technicznego i logistyki, rozbudowana o zapytania ofertowe, wyceny działów i rejestry.
kind: company
year: 2026
role: Rozwój i wdrożenia
stack: [PHP, JavaScript, MariaDB, Docker, nginx]
metric: { value: "5", label: "modułów w jednej aplikacji" }
order: 7
---

## Kontekst

Dział techniczny i logistyka firmy produkującej elektronikę potrzebowały jednego miejsca do pracy z zadaniami i dokumentami.

## Rozwiązanie

Aplikacja webowa obejmuje zadania, zapytania ofertowe (RFQ), wyceny działów, listę infrastruktury i rejestr substancji chemicznych. Działa w kontenerach Docker (PHP, MariaDB, Apache, brama nginx), z wersjonowanymi wydaniami, historią zmian oraz skryptami aktualizacji i kopii zapasowych.

## Efekt

Wydania produkcyjne trafiają do użytkowników powtarzalną ścieżką: kopia zapasowa, aktualizacja kontenerów, migracje.

## Moja rola

- rozwój nowych modułów,
- przeniesienie wdrożenia do Dockera,
- wydania, dokumentacja i utrzymanie.
