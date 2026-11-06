---
title: UniWskaźnik — fuel gauge calibration
summary: Electronics and firmware improving fuel-level indications in older cars, including vehicles with positive-ground electrical systems.
kind: company
year: 2024
role: Schematic, PCB, firmware and calibration
stack: [C/C++, Arduino, AVR, ATmega328PB, MCP4726, I2C, EEPROM, PCB]
metric: { value: "ADC → DAC", label: "signal adaptation for the fuel gauge" }
order: 15
---

## Context

Fuel gauges in older cars can show incorrect readings or fluctuate when driving over uneven terrain. UniWskaźnik was developed for these installations, including positive-ground vehicles and gauges without electronic assistance.

## Solution

I developed the schematic, PCB and firmware for a circuit that adapts the signal to the gauge. The microcontroller reads an analog input through the ADC and scales it to an output from the MCP4726 DAC over I²C.

The lower and upper indication points can be calibrated using buttons and a mode selector. Settings are stored in EEPROM and retained when power is removed. The firmware uses a signal-change threshold to avoid reacting to small input fluctuations.

## Outcome

The device was tested in multiple cars. It corrected inaccurate fuel-level indications and reduced fluctuations when driving over uneven terrain.

## My role

- schematic and PCB design,
- microcontroller firmware,
- calibration and settings storage.
