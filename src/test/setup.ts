import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import { resetHolidayCacheForTest } from '../utils/holidays';

beforeEach(() => {
  resetHolidayCacheForTest();
});
