import net from 'net';

/**
 * Find an available port starting from a given value (default: 5050).
 * It checks sequentially up to the maxPort value.
 * @param startAt The port number to start checking from.
 * @param maxPort The maximum port number to check.
 * @returns A free port number between startAt and maxPort.
 */
export async function findAvailablePort(startAt = 5050, maxPort = 5100): Promise<number> {
  const isPortFree = (port: number): Promise<boolean> =>
    new Promise((resolve) => {
      const server = net.createServer()
        .once('error', () => resolve(false))
        .once('listening', () => server.close(() => resolve(true)))
        .listen(port);
    });

  for (let port = startAt; port <= maxPort; port++) {
    if (await isPortFree(port)) return port;
  }

  throw new Error(`❌ No available port found between ${startAt} and ${maxPort}`);
}
