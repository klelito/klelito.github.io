---
title: Warehouse Transfer Scanning Assistant
summary: A Windows app that reads DataMatrix labels from a scanner and walks the warehouse operator through an SAP Business One stock transfer — without writing to the database.
kind: company
year: 2026
role: Design and implementation
stack: [C#, .NET, SAP Business One, DataMatrix, USB CDC]
metric: { value: "0", label: "writes to the SAP database — read-only" }
featured: true
order: 3
---

## Context

The warehouse records stock transfers (MM) in SAP Business One from DataMatrix labels on component packaging.

## Problem

Retyping item codes and quantities from labels is slow and error-prone, and the same package can be scanned twice.

## Solution

A standalone Windows x64 app receives labels from a USB scanner (COM port), reads the item master with a parameterised query, converts the quantity using the rule for the stock unit and enters the data into the SAP window by simulating the keyboard. A unique label ID prevents double scans, and the app offers signed updates by itself.

## Outcome

The program never writes to the SAP database and never posts documents: the operator stays in control, and the data reaches the document without retyping.

## My role

- designing and implementing the app,
- unit-conversion rules and double-scan protection,
- guides for operators and administrators.
