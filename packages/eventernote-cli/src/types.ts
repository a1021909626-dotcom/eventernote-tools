export type Flag = {
  name: string;
  arg?: string;
  description: string;
  required?: boolean;
};

export type Subcommand = {
  name: string;
  description: string;
  flags: Flag[];
  handler?: (
    get: (name: string) => string | undefined,
    has: (name: string) => boolean,
  ) => Promise<void>;
};

export type Domain = {
  name: string;
  description: string;
  subcommands: Subcommand[];
};
