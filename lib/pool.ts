export async function promisePool<I, O>(inputs: I[], limit: number, worker: (i: I, idx: number) => Promise<O>): Promise<O[]> {
  const results: O[] = new Array(inputs.length) as O[];
  let i = 0;
  let inFlight = 0;
  return new Promise((resolve, reject) => {
    const next = () => {
      if (i >= inputs.length && inFlight === 0) return resolve(results);
      while (inFlight < limit && i < inputs.length) {
        const idx = i++;
        inFlight++;
        Promise.resolve(worker(inputs[idx], idx))
          .then((res) => { results[idx] = res; })
          .catch((err) => { results[idx] = err as unknown as O; })
          .finally(() => { inFlight--; next(); });
      }
    };
    next();
  });
}

