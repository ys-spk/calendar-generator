import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import { resetGridCacheForTest } from '../hooks/useGridData';
import { resetHolidayCacheForTest } from '../utils/holidays';

beforeEach(() => {
  resetGridCacheForTest();
  resetHolidayCacheForTest();
});
