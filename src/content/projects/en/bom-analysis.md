---
title: BOM Analysis for Production Quotes
summary: An app that imports customer bills of materials, recognises their columns and matches MPNs to the SAP Business One item master — read-only.
kind: company
year: 2026
role: Design and implementation
stack: [Python, PostgreSQL, MS SQL, SAP Business One, Docker]
metric: { value: "MPN", label: "matching against the SAP item master (read-only)" }
featured: true
order: 2
---

## Context

The quoting team at an electronics manufacturer prepares quotes from bills of materials (BOMs) that customers send in many formats.

## Problem

Every file has a different column layout, and every line has to be looked up in the ERP item master together with stock levels and purchase history.

## Solution

The app imports XLSX, XLS and CSV files, recognises the columns, matches manufacturer part numbers (MPNs) to the SAP Business One item master, shows stock and recent purchases, stores analyses in PostgreSQL and produces XLSX and CSV reports. It connects to the SAP database read-only and has a simulated-SAP mode for testing.

## Outcome

The MVP covers the whole path from a customer file to a quote-ready report — without AI and without writing to the ERP.

## My role

- architecture and SAP Business One integration (SQL Server, read-only),
- import, MPN matching and reports,
- documentation and releases.
