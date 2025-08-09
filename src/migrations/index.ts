import * as migration_20241125_222020_initial from './20241125_222020_initial';
import * as migration_20241214_124128 from './20241214_124128';
import * as migration_20250809_215300 from './20250809_215300';
import * as migration_20250809_223517 from './20250809_223517';

export const migrations = [
  {
    up: migration_20241125_222020_initial.up,
    down: migration_20241125_222020_initial.down,
    name: '20241125_222020_initial',
  },
  {
    up: migration_20241214_124128.up,
    down: migration_20241214_124128.down,
    name: '20241214_124128',
  },
  {
    up: migration_20250809_215300.up,
    down: migration_20250809_215300.down,
    name: '20250809_215300',
  },
  {
    up: migration_20250809_223517.up,
    down: migration_20250809_223517.down,
    name: '20250809_223517'
  },
];
