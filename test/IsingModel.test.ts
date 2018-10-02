import IsingModel from '../src/IsingModel';

// ========================
// ==  metropolisSweep() ==
// ========================
describe('\nmetropolisSweep()', () => {
  const size = 3;
  const options = { T: 1E-12 };
  const isingModel = new IsingModel(size, options);

  it([
    'should turn the following configuration:',
    '\n\t[  1,  1,  1 ]',
    '\n\t[  1, -1,  1 ]',
    '\n\t[  1,  1,  1 ]',
    '\ninto the following configuration at T = 1E-12 with the same computed',
    ' hamiltonian and magnetisation',
    '\n\t[  1,  1,  1 ]',
    '\n\t[  1,  1,  1 ]',
    '\n\t[  1,  1,  1 ]'
  ].join(''), () => {
    const refIsingModel = new IsingModel(size, options);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        isingModel.spins[y][x].spin = 1;
        refIsingModel.spins[y][x].spin = 1;
      }
    }

    isingModel.spins[1][1].spin = -1;

    isingModel.metropolisSweep();
    refIsingModel.calculateSystemProperties();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const spin = isingModel.spins[y][x].spin;
        const refSpin = refIsingModel.spins[y][x].spin;

        expect(spin).toEqual(refSpin);
      }
    }

    expect(isingModel.H).toEqual(refIsingModel.H);
    expect(isingModel.M).toEqual(refIsingModel.M);
  });

  it([
    'should turn the following configuration:',
    '\n\t[ -1, -1, -1 ]',
    '\n\t[ -1,  1, -1 ]',
    '\n\t[ -1, -1, -1 ]',
    '\ninto the following configuration at T = 1E-12 with the same computed',
    ' hamiltonian and magnetisation',
    '\n\t[ -1, -1, -1 ]',
    '\n\t[ -1, -1, -1 ]',
    '\n\t[ -1, -1, -1 ]',
  ].join(''), () => {
    const refIsingModel = new IsingModel(size, options);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        isingModel.spins[y][x].spin = -1;
        refIsingModel.spins[y][x].spin = -1;
      }
    }

    isingModel.spins[1][1].spin = 1;

    isingModel.metropolisSweep();
    refIsingModel.calculateSystemProperties();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const spin = isingModel.spins[y][x].spin;
        const refSpin = refIsingModel.spins[y][x].spin;

        expect(spin).toEqual(refSpin);
      }
    }

    expect(isingModel.H).toEqual(refIsingModel.H);
    expect(isingModel.M).toEqual(refIsingModel.M);
  });

  it([
    'should turn the following configuration:',
    '\n\t[  1, -1, -1 ]',
    '\n\t[ -1, -1, -1 ]',
    '\n\t[ -1, -1, -1 ]',
    '\ninto the following configuration at T = 1E-12 with the same computed',
    ' hamiltonian and magnetisation',
    '\n\t[ -1, -1, -1 ]',
    '\n\t[ -1, -1, -1 ]',
    '\n\t[ -1, -1, -1 ]',
  ].join(''), () => {
    const refIsingModel = new IsingModel(size, options);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        isingModel.spins[y][x].spin = -1;
        refIsingModel.spins[y][x].spin = -1;
      }
    }

    isingModel.spins[0][0].spin = -1;

    isingModel.metropolisSweep();
    refIsingModel.calculateSystemProperties();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const spin = isingModel.spins[y][x].spin;
        const refSpin = refIsingModel.spins[y][x].spin;

        expect(spin).toEqual(refSpin);
      }
    }

    expect(isingModel.H).toEqual(refIsingModel.H);
    expect(isingModel.M).toEqual(refIsingModel.M);
  });
});

// ==============
// ==  wolff() ==
// ==============
describe('\nwolff()', () => {
  const size = 3;
  const options = { T: 1E-12 };
  const isingModel = new IsingModel(size, options);

  it([
    'should turn the following configuration:',
    '\n\t[  1,  1,  1 ]',
    '\n\t[  1,  1,  1 ]',
    '\n\t[  1,  1,  1 ]',
    '\ninto the following configuration at T = 1E-12 with the same computed',
    ' hamiltonian, and a magnetisation with the opposite sign',
    '\n\t[ -1, -1, -1 ]',
    '\n\t[ -1, -1, -1 ]',
    '\n\t[ -1, -1, -1 ]'
  ].join(''), () => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        isingModel.spins[y][x].spin = 1;
      }
    }

    isingModel.wolff();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        expect(isingModel.spins[y][x].state).toEqual(4);
      }
    }

    expect(isingModel.H).toEqual(-(size * size * 2));
    expect(isingModel.M).toEqual(-1);
  });

  it([
    'should turn the following configuration:',
    '\n\t[ -1, -1, -1 ]',
    '\n\t[ -1, -1, -1 ]',
    '\n\t[ -1, -1, -1 ]',
    '\ninto the following configuration at T = 1E-12 with the same computed',
    ' hamiltonian, and a magnetisation with the opposite sign',
    '\n\t[  1,  1,  1 ]',
    '\n\t[  1,  1,  1 ]',
    '\n\t[  1,  1,  1 ]'
  ].join(''), () => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        isingModel.spins[y][x].spin = -1;
      }
    }

    isingModel.wolff();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        expect(isingModel.spins[y][x].state).toEqual(4);
      }
    }

    expect(isingModel.H).toEqual(-(size * size * 2));
    expect(isingModel.M).toEqual(1);
  });
});

// ==================================
// ==  calculateSystemProperties() ==
// ==================================
describe('\ncalculateSystemProperties()', () => {
  const size = 4;
  const isingModel = new IsingModel(size);

  it([
    'should set the value of the H property (hamiltonion) to -32, the',
    ' M (magnetisation) property to 1, and the state property of every site to',
    ' be 4 for the following configuration:',
    '\n\t[  1,  1,  1,  1 ]',
    '\n\t[  1,  1,  1,  1 ]',
    '\n\t[  1,  1,  1,  1 ]',
    '\n\t[  1,  1,  1,  1 ]'
  ].join(''), () => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        isingModel.spins[y][x].spin = 1;
      }
    }

    isingModel.calculateSystemProperties();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        expect(isingModel.spins[y][x].state).toEqual(4);
      }
    }

    expect(isingModel.H).toEqual(-(size * size * 2));
    expect(isingModel.M).toEqual(1);
  });

  it([
    'should set the value of the H property (hamiltonion) to -32, the',
    ' M (magnetisation) property to 1, and the state property of every site to',
    ' be 4 for the following configuration:',
    '\n\t[ -1, -1, -1, -1 ]',
    '\n\t[ -1, -1, -1, -1 ]',
    '\n\t[ -1, -1, -1, -1 ]',
    '\n\t[ -1, -1, -1, -1 ]'
  ].join(''), () => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        isingModel.spins[y][x].spin = -1;
      }
    }

    isingModel.calculateSystemProperties();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        expect(isingModel.spins[y][x].state).toEqual(4);
      }
    }

    expect(isingModel.H).toEqual(-(size * size * 2));
    expect(isingModel.M).toEqual(-1);
  });

  it([
    'should set the value of the H property (hamiltonion) to +32 and',
    ' the M (magnetisation) property to 0, and the state property of every',
    ' site to be -4 for the following configuration:',
    '\n\t[  1, -1,  1, -1 ]',
    '\n\t[ -1,  1, -1,  1 ]',
    '\n\t[  1, -1,  1, -1 ]',
    '\n\t[ -1,  1, -1,  1 ]'
  ].join(''), () => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if ((x + y) % 2 === 0) {
          isingModel.spins[x][y].spin = 1;
        }
        else {
          isingModel.spins[x][y].spin = -1;
        }
      }
    }

    isingModel.calculateSystemProperties();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        expect(isingModel.spins[y][x].state).toEqual(-4);
      }
    }

    expect(isingModel.H).toEqual(size * size * 2);
    expect(isingModel.M).toEqual(0);
  });
});
