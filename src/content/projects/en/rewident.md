---
title: Rewident — quality and repair workflows with SAP Business One
summary: Ongoing development of an inherited MES application with service-management functions, used by production, quality control, repair teams and managers.
kind: company
year: 2026
role: Development and improvements to an existing application
stack: [VB.NET, WinForms, .NET Framework 4.8, SQL Server, SAP Business One, ZPL, Docker, GitHub Actions, Claude Code, Codex]
metric: { value: "51", label: "issues from analysing the inherited code" }
order: 13
---

## Context

I took over the development of an existing Windows application used across production, the repair department, quality control and management at an electronics manufacturer. Rewident connects SAP Business One data with quality and repair records.

## Solution

I introduce fixes and improvements to a system supporting product inspections, sample and defect records, repairs and supplier material claims. Repair records include time, parts and costs. The application also provides access to production documentation, DataMatrix/ZPL labels and Excel export.

Application records are stored in SQL Server, while SAP Business One data is retrieved through read access. The system covers MES workflows and selected service-management functions within the FSM domain.

I organised work on the inherited code in a repository. I recorded the findings of a code analysis as 51 GitHub issues: bugs, risks, technical debt and feature proposals. Changes go through branches, MSTest tests against a SQL Server test database in Docker, and CI on GitHub Actions. I also set up a working environment for AI agents in Claude Code and Codex: shared project rules, five skills, a review subagent and a guard that blocks agents from secrets, databases outside the test environment and protected branches.

## Outcome

Rewident serves as a shared tool for production, quality, repair teams and managers. My work in 2026 builds on this established system through fixes and improvements to functions used every day.

## My role

- taking over development of an existing application,
- code analysis, repository, tests and CI,
- the AI agent environment (Claude Code, Codex),
- implementing fixes,
- improving functions used in everyday work.
