---
title: K-GST — gesture control for TV lifts
summary: A hand-gesture accessory for TV lifts, covering the schematic, PCB, firmware, enclosure and testing through to a commercial release.
kind: company
year: 2024
role: Schematic, PCB, firmware, enclosure and testing
stack: [C/C++, Arduino, ATtiny3224, PAJ7620U2, I2C, PCB]
metric: { value: "On sale", label: "gesture-controlled accessory" }
results:
  - { value: "2 / 4", label: "control channels across two versions" }
  - { value: "On sale", label: "device available to users" }
order: 16
---

## Context

K-GST adds hand-gesture operation to a TV lift. The accessory translates a recognized movement into a control command and provides LED feedback.

## Solution

I developed the circuit schematic, PCB, firmware, enclosure and device tests. An ATtiny3224 microcontroller reads gestures from a PAJ7620U2 sensor over I²C and maps them to the relevant control outputs.

The firmware defines control-signal duration and LED fade-in and fade-out behavior. I prepared versions supporting 2 or 4 control channels.

## Outcome

The device entered commercial sale. My work covered electronics and embedded software, the physical enclosure and device testing.

## My role

- schematic and PCB design,
- firmware for the 2- and 4-channel versions,
- enclosure design,
- test preparation and execution.
