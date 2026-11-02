---
title: BOM Converter
summary: Normalizes customer bills of materials and automatically matches MPNs to the ERP item master.
kind: company
year: 2024
duration: 4 months
role: Design, implementation, rollout
stack: [Python, FastAPI, MS SQL, Docker]
metric: { value: "−70%", label: quoting time }
results:
  - { value: "−70%", label: time to prepare a quote }
  - { value: "95%", label: MPNs matched automatically }
  - { value: "2,000+", label: BOM lines per week }
featured: true
order: 1
---

## Context

The quoting team at a contract electronics manufacturer receives bills of materials from customers in dozens of formats.

## Problem

Retyping lines and searching the item master for equivalents took up to several hours per quote and caused errors.

- every customer sends a BOM with a different column layout,
- manufacturer part numbers (MPN) are written inconsistently,
- matching to stock items meant searching the item master by hand.

## Solution

The tool reads the customer file, normalizes columns and values, then matches every line to the ERP item master — first by exact MPN, then by parameters. The result is a quote-ready report that flags the lines needing a human decision.

## Outcome

Preparing a quote went from 3–4 hours to about one hour, and 95% of lines are matched automatically.

## My role

- analysed the quoting process together with the sales team,
- designed and implemented the whole tool,
- rolled it out in Docker containers and supported the users.
