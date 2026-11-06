---
title: Encrypted radio control between a remote and receiver
summary: A personal transmitter and radio-link design using Microchip HCS devices (KeeLoq) to protect control commands between a remote and its receiver.
kind: own
year: 2024
role: Independent radio-link and transmitter design
stack: [Microchip HCS, KeeLoq, RF, Electronics, Transmitter design]
metric: { value: "KeeLoq", label: "rolling code between remote and receiver" }
order: 17
---

## Context

The goal was to protect radio control between a remote and receiver. The radio signal can be received by anyone nearby, so the focus was on making sure a captured command could not be reused to operate the device again.

## Solution

I independently developed the radio link, including my own transmitter design. I used Microchip HCS-family devices, which encrypt commands with the KeeLoq rolling-code algorithm.

The work covered transmitter electronics and command transmission to the receiver. The rolling code does not hide the transmission itself, but it limits the reuse of previously received control commands.

## Outcome

The result was a personal radio-control design based on HCS (KeeLoq) encoding, combining transmitter development with protection of transmitted commands.

## My role

- independently developing the project,
- designing the transmitter,
- applying HCS devices to protect control commands.
