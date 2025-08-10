import * as migration_20250810_999999_baseline from './20250810_999999_baseline';

export const migrations = [
  {
    up: migration_20250810_999999_baseline.up,
    down: migration_20250810_999999_baseline.down,
    name: '20250810_999999_baseline',
  },
];
