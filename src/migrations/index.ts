import * as migration_20260330_080224 from './20260330_080224';

export const migrations = [
  {
    up: migration_20260330_080224.up,
    down: migration_20260330_080224.down,
    name: '20260330_080224'
  },
];
