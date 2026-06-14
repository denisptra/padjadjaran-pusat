import { SetMetadata } from '@nestjs/common';

export const REQUIRE_ACTION_KEY = 'require_action';
export const RequireAction = (action: string) =>
  SetMetadata(REQUIRE_ACTION_KEY, action);
