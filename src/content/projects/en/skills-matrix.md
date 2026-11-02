---
title: Skills Matrix
summary: A web app for keeping the team's skills matrix — Django and PostgreSQL, deployed with Docker.
kind: company
year: 2026
role: Design and implementation
stack: [Python, Django, PostgreSQL, Docker]
metric: { value: "1", label: "shared view of team skills" }
order: 8
---

## Context

The team needed a single place that shows employees' skills.

## Solution

A Django app with PostgreSQL (including a cloud database over TLS), run in Docker. It has separate environments: local with a test database, one updated from the main branch, and production on a Windows virtual machine on the company network.

## My role

- designing and implementing the app,
- environment configuration and deployments,
- setup documentation.
