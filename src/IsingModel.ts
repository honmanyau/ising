export interface IsingModelSite {
  spin: -1 | 1;
  state: number | null;
}

export interface IsingModelOptions {
  k?: number;
  J?: number;
  T?: number;
  saveConfig?: boolean;
}

export interface IsingModelData {
  H: number;
  M: number;
  k: number;
  J: number;
  T: number;
  config: IsingModelSite[][] | null;
}

export default class IsingModel {
  public data: IsingModelData[];
  public spins: IsingModelSite[][];
  public size: number;
  public H: number;
  public M: number;
  public k: number;
  public J: number;
  public T: number;
  public Tc: number;
  public β: number;
  public saveConfig: boolean;

  constructor(size: number, options: IsingModelOptions = {}) {
    this.size = size;
    this.k = options.k || 1;
    this.J = options.J || 1;
    this.T = options.T || 0.01;
    this.saveConfig = options.saveConfig || false;

    this.data = [];

    this.calculateTc();
    this.calculateβ();

    this.generateInitialState();
  }

  /**
   * This method caluclates the hamiltonian and magnetisation of the current
   * configuration and store them in {@code this.H} and
   * {@code this.M} respectively. It is important to note that each
   * interaction between two spins is only considered once for hamiltonian
   * calculation. The properties are calculated in a single method to reduce
   * the need for additional loops.
   */
  public calculateSystemProperties = (): void => {
    const { size, J, calculateSiteΣσj } = this;
    let spinTotal = 0;
    let Σσiσj = 0;

    this.spins.forEach((row, rowIndex) => {
      row.forEach((site, colIndex) => {
        const siteΣσj = calculateSiteΣσj(rowIndex, colIndex);

        Σσiσj += site.spin * siteΣσj / 2;
        spinTotal += site.spin;
        site.state = site.spin * siteΣσj;
      });
    });

    this.M = spinTotal / (size ** 2);
    this.H = -J * Σσiσj;
  }

  /**
   * This method applies the Metropolis-Hasting algorithm to every single spin
   * in {@code this.spins}. The Durstenfeld shuffling algorithm is used to
   * randomise spin sampling as it is not entirely clear if sweeping in the same
   * order every time, simply by incrementing the row and column indicies with
   * 2 for loops, would lead to unintended bias.
   * @param {number} [iterations=1] The number of iterations to run the
   *     algorithm for.
   */
  public metropolisSweep = (iterations: number = 1): void => {
    for (let iteration = 0; iteration < iterations; iteration++) {
      const { spins, J, β } = this;
      const { calculateSiteΣσj, calculateTc, calculateβ } = this;
      const rowIndicies = this.generateRandomIndicies(this.size);

      calculateTc();
      calculateβ();

      rowIndicies.forEach((rowIndex) => {
        const colIndicies = this.generateRandomIndicies(this.size);

        colIndicies.forEach((colIndex) => {
          const site = spins[rowIndex][colIndex];
          const siteΣσj = calculateSiteΣσj(rowIndex, colIndex);
          const state = site.spin * siteΣσj;
          const flippedState = -site.spin * siteΣσj;
          const ΔH = -J * (flippedState - state);

          if (ΔH < 0) {
            site.spin *= -1;
          }
          else {
            // Calculate the acceptance probability of the flipped state and
            // flip accordingly. If a randomly-generated number, p, is within
            // the bounds of Α, flip the spin.
            const A = Math.exp(-β * ΔH);

            if (Math.random() < A) {
              site.spin *= -1;
            }
          }

          site.state = site.spin * siteΣσj;
        });
      });

      this.calculateSystemProperties();
      this.createSnapshot();
    }
  }

  /**
   * This method is an implementation of the Wolff algorithm for clustered spin
   * flip. References:
   * arXiv:cond-mat/0311623v1 [cond-mat.stat-mech]
   * http://itf.fys.kuleuven.be/~enrico/Teaching/monte_carlo_2014.pdf
   * @param {number} [iterations=1] The number of iterations to run the
   *     algorithm for.
   */
  public wolff = (iterations: number = 1): void => {
    for (let iteration = 0; iteration < iterations; iteration++) {
      const { size, spins, J, β } = this;
      const { calculateTc, calculateβ, mod } = this;
      const seedRowIndex = Math.floor(Math.random() * size);
      const seedColIndex = Math.floor(Math.random() * size);
      const cluster = [ [ seedRowIndex, seedColIndex ] ];
      const clustered = { [`${seedRowIndex}-${seedColIndex}`]: true };
      const p = 1 - Math.exp(-2 * β * J); // Clustering probability

      calculateTc();
      calculateβ();

      while (cluster.length > 0) {
        const [ rowIndex, colIndex ] = cluster.shift() as number[];
        const σi = spins[rowIndex][colIndex].spin;

        [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ 0, 1 ] ].forEach((δindicies) => {
          const [ δrowIndex, δcolIndex ] = δindicies;
          const neighbourRowIndex = mod(rowIndex + δrowIndex, size);
          const neighbourColIndex = mod(colIndex + δcolIndex, size);
          const σj = spins[neighbourRowIndex][neighbourColIndex].spin;

          if (σi === σj && Math.random() < p) {
            const id = `${neighbourRowIndex}-${neighbourColIndex}`;

            if (!clustered[id]) {
              cluster.push([ neighbourRowIndex, neighbourColIndex ]);
              clustered[id] = true;
            }
          }
        });

        this.spins[rowIndex][colIndex].spin *= -1;
      }

      this.calculateSystemProperties();
      this.createSnapshot();
    }
  }

  /**
   * This method calculates Tc and assign the result to {@code this.Tc}.
   */
  private calculateTc = (): void => {
    this.Tc = (this.J * 2) / (this.k * Math.log(1 + Math.sqrt(2)));
  }

  /**
   * This method calculates the sum of all neighbouring spins for a given site.
   * @param {number} rowIndex The row index of a given site
   * @param {number} colIndex The col index of a given site
   * @returns {number} The sum of all neighbouring spins of a given site
   */
  private calculateSiteΣσj = (rowIndex: number, colIndex: number): number => {
    const { spins, mod, size } = this;
    const σjLeft = spins[rowIndex][mod(colIndex - 1, size)].spin;
    const σjRight = spins[rowIndex][mod(colIndex + 1, size)].spin;
    const σjUp = spins[mod(rowIndex - 1, size)][colIndex].spin;
    const σjDown = spins[mod(rowIndex + 1, size)][colIndex].spin;

    return σjLeft + σjRight + σjUp + σjDown;
  }

  /**
   * This method calculates β and assign the result to {@code this.β}.
   */
  private calculateβ = (): void => {
    this.β = (this.k * this.T) ** -1;
  }

  /**
   * This method generates a configuration with randomised spins and assign
   * the result to {@code this.spins}.
   */
  private generateInitialState = (): void => {
    // Create an array of {@code this.size} subarrays, where each subarray
    // contains the data for a site according to the interface {@code ISite}.
    this.spins = Array.from({ length: this.size }).map(() => {
      const row = Array.from({ length: this.size }).map(() => {
        const site: IsingModelSite = {
          spin: Math.random() < 0.5 ? 1 : -1,
          state: null
        };

        return site;
      });

      return row;
    });

    this.calculateSystemProperties();
  }

  /**
   * This method generates an array of zero-based indicies of length
   * {@code size} that is shuffled using the Durstenfeld algorithm.
   * @param {number} size The number of indicies to be generated.
   */
  private generateRandomIndicies = (size: number): number[] => {
    const indicies = Array.from({ length: size }).map((_v, i) => i);

    for (let i = this.size - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [indicies[i], indicies[j]] = [indicies[j], indicies[i]];
    }

    return indicies;
  }

  /**
   * This method is a modulo implementation that takes into account the sign of
   * the operands.
   * @param {number} dividend The dividend in the modulo operation.
   * @param {number} divisor The divisor in the modulo operation.
   */
  private mod = (dividend: number, divisor: number): number => {
    const absDivisor = Math.abs(divisor);

    return ((dividend % absDivisor) + absDivisor) % absDivisor;
  }

  /**
   * This method pushes a snapshort of some of the parameters and the current
   * configuration of the ising model to {@code this.data}.
   */
  private createSnapshot = (): void => {
    this.data.push({
      H: this.H,
      M: this.M,
      k: this.k,
      J: this.J,
      T: this.T,
      config: this.saveConfig ? JSON.parse(JSON.stringify(this.spins)) : null
    });
  }
}
