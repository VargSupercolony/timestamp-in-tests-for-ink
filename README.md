# README!

### Motivation

The motivation of this is to have `api.tx.timestamp.set` function
from Polkadot.js available for use in integration tests.

### The problem

The problem is that `set()` function  in `timestamp` pallet
only allows calls with `inherent` origin because of mandatory
dispatch.

### Libraries used

* [ink!](https://github.com/paritytech/ink) - the smart contracts

* [redspot](https://github.com/patractlabs/redspot) - integration tests

* [jupiter](https://github.com/patractlabs/jupiter) - the node

### Structure

The structure of the project is a mix of ink! and TypeScript.
Please see redspot.config.ts for Redspot configuration. 
The integration tests are located in the `tests` directory.
The `artifacts` folder contains the contract artifacts.