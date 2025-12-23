const secrets = [
    process.env.PRG_TOKEN_MINT_ADDRESS,
    process.env.TOKEN_SENDER_SECRET_KEY,
    process.env.WORKER_SECRET,
  ].filter(Boolean) as string[];
  
  function mask(value: string): string {
    return value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : '***';
  }
  
  function sanitize(input: unknown): unknown {
    if (typeof input === 'string') {
      let sanitized = input;
      for (const secret of secrets) {
        sanitized = sanitized.split(secret).join(mask(secret));
      }
      return sanitized;
    }
    if (typeof input === 'object' && input !== null) {
      try {
        return JSON.parse(sanitize(JSON.stringify(input)) as string);
      } catch {
        return input;
      }
    }
    return input;
  }
  
  export const logger = {
    log: (...args: unknown[]) => console.log(...args.map(sanitize)),
    warn: (...args: unknown[]) => console.warn(...args.map(sanitize)),
    error: (...args: unknown[]) => console.error(...args.map(sanitize)),
  };
  