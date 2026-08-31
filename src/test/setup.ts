import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import { resetHolidayCacheForTest } from '../utils/holidays';

beforeEach(() => {
  resetHolidayCacheForTest();
});
