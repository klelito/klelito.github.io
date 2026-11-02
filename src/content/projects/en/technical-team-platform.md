---
title: Technical & Logistics Team Platform
summary: An internal web app for managing the technical and logistics teams' tasks, extended with requests for quotation, department quotes and registers.
kind: company
year: 2026
role: Development and deployments
stack: [PHP, JavaScript, MariaDB, Docker, nginx]
metric: { value: "5", label: "modules in one app" }
order: 7
---

## Context

The technical and logistics teams of an electronics manufacturer needed one place to work with tasks and documents.

## Solution

The web app covers tasks, requests for quotation (RFQ), department quotes, an infrastructure list and a chemical-substances register. It runs in Docker containers (PHP, MariaDB, Apache, an nginx gateway) with versioned releases, a changelog, and update and backup scripts.

## Outcome

Production releases reach users through a repeatable path: backup, container update, migrations.

## My role

- developing new modules,
- moving the deployment to Docker,
- releases, documentation and maintenance.
