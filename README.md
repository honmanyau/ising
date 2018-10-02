# Ising

>  A JavaScript library for Monte Carlo simulations of the 2D Ising model.

## Table of Contents

* [Introduction](#introduction)
* [Installation](#installation)
* [Quick Start](#quick-start)
* [Changelog](#changelog)
* [License](#license)

## Introduction

Ising is a JavaScript library for Monte Carlo simulations of the 2D Ising model in the browser or in a [Node.js](https://nodejs.org) environment.

An Ising model created with this library is a simplified square lattice that assumes zero external field and periodic boundary conditions are applied to ensure that all sites have an equal number of neighbours. Calculations can be performed using either the [Metropolis-Hastings algorithm ](https://en.wikipedia.org/wiki/Metropolis%E2%80%93Hastings_algorithm) or the [Wolff algorithm](https://en.wikipedia.org/wiki/Wolff_algorithm).

## Installation

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

// Simulationusing the Wolff algorithm
model.wolff(SIMULATION_STEPS);

console.log(model.J); // Nearest-neighbour interaction strength J. Default is 1.
console.log(model.k); // Boltzmann constant k. Default is 1.
console.log(model.Tc); // Critical Temperature Tc. Computed using J and k.
console.log(model.data); // An array of arrays of spins (see documentation).
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](https://github.com/honmanyau/chronik/blob/master/LICENSE)
