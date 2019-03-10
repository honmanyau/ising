**This repository is no longer maintained due to a complete rewrite and will be archived. Please use it with caution.**

# Ising

[![NPM version](https://badge.fury.io/js/ising.svg)](http://badge.fury.io/js/ising)
[![Known Vulnerabilities](https://snyk.io/test/npm/ising/badge.svg)](https://snyk.io/test/npm/ising)
[![License: MIT](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/honmanyau/ising/blob/master/LICENSE.md)

>  A JavaScript library for Monte Carlo simulations of the 2D Ising model.

## Table of Contents

* [Introduction](#introduction)
* [Installation](#installation)
* [Quick Start](#quick-start)
* [API Reference](#api-reference)
  * [`IsingModel`](#isingmodel)
  * [`model.data`](#modeldata)
  * [`model.k`](#modelk)
  * [`model.saveConfig`](#modelsaveconfig)
  * [`model.size`](#modelsize)
  * [`model.spins`](#modelspins)
  * [`model.H`](#modelh)
  * [`model.J`](#modelj)
  * [`model.M`](#modelm)
  * [`model.T`](#modelt)
  * [`model.Tc`](#modeltc)
  * [`model.β`](#modelβ)
  * [`model.calculateSystemProperties()`](#modelcalculatesystemproperties)
  * [<code>model.metropolisSweep(*[iterations]*)</code>](#modelmetropolissweepiterations)
  * [<code>model.wolff(*[iterations]*)</code>](#modelwolffiterations)
* [Changelog](#changelog)
* [License](#license)

## Introduction

Ising is a JavaScript library for Monte Carlo simulations of the 2D Ising model in the browser or in a [Node.js](https://nodejs.org) environment.

An Ising model created with this library is a simplified square lattice that assumes zero external field and periodic boundary conditions are applied to ensure that all sites have an equal number of neighbours. Calculations can be performed using either the [Metropolis-Hastings algorithm ](https://en.wikipedia.org/wiki/Metropolis%E2%80%93Hastings_algorithm) or the [Wolff algorithm](https://en.wikipedia.org/wiki/Wolff_algorithm).

**Please note that this is currently an experimental library (no pun intended). Contributions and suggestions are welcomed.**

## Installation

For a Node.js environment:

```sh
# Using NPM
npm i ising

# Using yarn
yarn add ising
```

Alternatively, the latest release can also be downloaded [here](https://github.com/honmanyau/ising/releases) and used in the browser:

```html
<script src="ising.js"></script>
<!-- The script exposes the IsingModel -->
```

## Quick Start

```javascript
import IsingModel from 'ising';

// ===================
// == Configuration ==
// ===================
const MODEL_SIZE = 10;
const SIMULATION_STEPS = 1000;

// ==========
// == Main ==
// ==========
const model = new IsingModel(MODEL_SIZE);

// Simulation using the Metropolis-Hastings algorithm
model.metropolisSweep(SIMULATION_STEPS);

// Simulation using the Wolff algorithm
model.wolff(SIMULATION_STEPS);

console.log(model.J); // Nearest-neighbour interaction strength J. Default is 1.
console.log(model.k); // Boltzmann constant k. Default is 1.
console.log(model.Tc); // Critical Temperature Tc. Computed using J and k.
console.log(model.spins); // An array of arrays of spins (see documentation).
console.log(model.data); // A log created during simulation (see documentation).
```

## API Reference

### `IsingModel`

The `IsingModel` class is a constructor function used for creating a model object that contains the data for an Ising model simulation the methods for manipulating the model. The model created assumes zero external field and represents a square lattice with periodic boundary conditions applied on all sides.

#### Parameters

* `size`: the number of spins in both dimensions of the square lattice; the total number of spins in the model created is `size * size`
* `options` (optional): an object that contains custom parameters that the Ising model will be constructed with. The available options are:
  * `k`: Boltzmann constant. The default value is `1`. See [`model.k`](#modelk) for additional information.
  * `J`: nearest neighbour interaction strength. The default value is `1`. See [`model.J`](#modelj) for additional information.
  * `T`: heat bath temperature. The default is `0.01`. See [`model.T`](#modelt) for additional information.
  * `saveConfig`: a boolean value indicating whether or or not configurations will be logged during simulation. The default value is `false`. When set to `true`, the entire configuration will also be added to the `config` property of a log object that is added to `model.data` every step. See [`model.saveConfig`](#modelsaveconfig) for additional information.

### `model.data`

An array that contains objects that are created at the end of every simulation step, where each object has the following properties:

* `k`: Boltzmann constant applied to the configuration.
* `J`: nearest neighbour interaction strength applied to the configuration.
* `T`: heat bath temperature applied to the configuration.
* `M`: the computed magnetisation of the configuration.
* `H`: the computed Hamiltonian of the configuration.
* `config`: a snapshot of the configuration created by deep-cloning `model.spins`.

### `model.k`

The value of the Boltzmann constant that the model uses.

The value can be changed during a simulation safely during a simulation as the values that depend on it, namely the critical temperature `Tc`, are recomputed at the beginning of every simulation step. If this value is not set using an `options` object during model construction or set outside of a simulation cycle, the method `model.calculateSystemProperties` should be called to recompute `Tc`.

### `model.saveConfig`

A boolean value indicating whether or or not configurations will be logged during simulation. The default value is `false`. When set to `true`, the entire configuration will also be added to the `config` property of a log object that is added to `model.data` every step. It should be noted that this is both memory and temporally expansive; the following example shows how one could avoid storing configurations in `model.data` unnecessarily:

```javascript
// ===================
// == Configuration ==
// ===================
const MODEL_SIZE = 10;
const EQUILIBRATION_STEPS = 2000;
const COLLECTION_STEPS = 250;

// ==========
// == Main ==
// ==========
const model = new IsingModel(MODEL_SIZE); // saveConfig is false by default

model.wolff(EQUILIBRATION_STEPS);

model.saveConfig = true;
model.wolff(COLLECTION_STEPS);
  ```

### `model.size`

The number of spins in both dimensions of the square lattice; the total number of spins in the model created is the square of this value.

### `model.spins`

An array of size `model.size`, where each subarray is also of `model.size` and contains objects of with the following properties:

* `spin`: the spin at a given site, which takes the value of either `-1` or `1`.
* `state`: a value that describes the sum of the product of spins at a given site and its four neighbours. The value can be `-4`, `-2`, `0`, `2` or `4`.

### `model.H`

The Hamiltonian computed for the current configuration, where H = -JΣσjσi; the term Σσjσi is the sum of the products of every pair of spins (each pair is only counted once). This value is computed when a model object is constructed, at the end of every simulation step, or when the `model.calculateSystemProperties` method is called.

### `model.J`

The value of the nearest neighbour interaction strength that the model uses.

The value can be changed during a simulation safely during a simulation as the values that depend on it, namely the critical temperature `Tc` and inverse temperature `β`, are recomputed at the beginning of every simulation step. If this value is not set using an `options` object during model construction or set outside of a simulation cycle, the method `model.calculateSystemProperties` should be called to recompute `Tc` and `β`.

### `model.M`

The magnetisation computed for the current configuration, where M = Σσi / N; Σσi is the sum of all spins and N is the total number of spins in the lattice. This value is computed when a model object is constructed, at the end of every simulation step, or when the `model.calculateSystemProperties` method is called.

### `model.T`

The value of the heat bath temperature that the model uses. The value can be changed during a simulation safely during a simulation as the values that depend on it, namely the inverse temperature `β`, are recomputed at the beginning of every simulation step. If this value is not set using an `options` object during model construction or set outside of a simulation cycle, the method `model.calculateSystemProperties` should be called to recompute `β`.

### `model.Tc`

The value of the critical temperature computed from `model.k` and `model.J`, where Tc = 2J / k*ln*(1 + √2). This value is calculated when a model object is constructed, at the beginning of every step during a simulation, or when the `model.calculateSystemProperties` method is called.

### `model.β`

The value of the inverse temperature computed from `model.k` and `model.T`, where β = 1 / (kT). This value is calculated when a model object is constructed, at the beginning of every step during a simulation, or when the `model.calculateSystemProperties` method is called.


### `model.calculateSystemProperties()`

This method updates the values of `model.Tc` (critical temperature), `model.β` (inverse temperature), and calculates `model.H` (Hamiltonian) and `model.M` (magnetisation) for the current configuration.

### <code>model.metropolisSweep(*[iterations]*)</code>

This method is an implementation of the Metropolis-Hasting algorithm. In every iteration, every spin in the square lattice is considered by the algorithm exactly once (hence a "sweep").

It is worth noting that the order in which spins are considered is somewhat randomised at the beginning of each iteration. Specifically, the order in which rows are chosen and each spin in a row is processed are both (pseudo)randomised, but every spin in a row is processed before moving onto the next, (pseudo)randomly-chosen row.

#### Parameters

* `iterations`: the number of sweeps to perform the Metropolis-Hasting algorithm on the model.

### <code>model.metropolisSweep(*[iterations]*)</code>

This method is an implementation of the Wolff algorithm for clustered updates. It should be noted that, unlike the `model.metropolisSweep` method, only one spin is considered each iteration.

#### Parameters

* `iterations`: the number of sweeps to perform the Metropolis-Hasting algorithm on the model.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE.md)
