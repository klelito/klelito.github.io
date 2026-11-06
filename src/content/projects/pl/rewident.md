---
title: Rewident — jakość i serwis z SAP Business One
summary: Rozwój przejętego systemu MES z funkcjami obsługi serwisu, używanego przez produkcję, kontrolę jakości, serwis i menedżerów.
kind: company
year: 2026
role: Rozwój i usprawnienia istniejącej aplikacji
stack: [VB.NET, WinForms, .NET Framework 4.8, SQL Server, SAP Business One, ZPL, Docker, GitHub Actions, Claude Code, Codex]
metric: { value: "51", label: "zgłoszeń z analizy przejętego kodu" }
order: 13
---

## Kontekst

Przejąłem do dalszego rozwoju istniejącą aplikację Windows, z której korzystają cała produkcja, serwis, dział kontroli jakości i menedżerowie firmy z branży elektroniki. Rewident łączy dane SAP Business One z rejestrami jakości i napraw.

## Rozwiązanie

Wprowadzam poprawki i usprawnienia w systemie wspierającym kontrolę wyrobów, rejestrowanie próbek i błędów, obsługę napraw oraz reklamacje materiałów do dostawców. Karty napraw obejmują czas, użyte części i koszty. Aplikacja udostępnia także dokumentację produkcyjną, etykiety DataMatrix/ZPL i eksport danych do Excela.

Rejestry aplikacji są przechowywane w SQL Server, a dane z SAP Business One są pobierane w trybie odczytu. System obejmuje obszar MES oraz wybrane funkcje obsługi serwisu z zakresu FSM.

Pracę nad przejętym kodem uporządkowałem w repozytorium. Wyniki analizy kodu opisałem jako 51 zgłoszeń na GitHubie: błędy, ryzyka, dług techniczny i propozycje funkcji. Zmiany przechodzą przez gałęzie, testy MSTest na testowej bazie SQL Server w Dockerze i CI w GitHub Actions. Przygotowałem też środowisko pracy agentów AI dla Claude Code i Codex: wspólne zasady projektu, pięć skilli, subagenta do recenzji zmian i strażnika, który blokuje agentom dostęp do sekretów, baz spoza środowiska testowego i chronionych gałęzi.

## Efekt

Rewident jest wspólnym narzędziem pracy produkcji, jakości, serwisu i kadry zarządzającej. W 2026 roku rozwijam tę istniejącą bazę poprzez poprawki i usprawnienia funkcji wykorzystywanych na co dzień.

## Moja rola

- przejęcie istniejącej aplikacji do dalszego rozwoju,
- analiza kodu, repozytorium, testy i CI,
- środowisko pracy agentów AI (Claude Code, Codex),
- wprowadzanie poprawek,
- usprawnianie funkcji używanych w codziennej pracy.
