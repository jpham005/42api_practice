import * as dotenv from 'dotenv';
import { appDefine } from './model/appDefine.model.js';
import { campusUsers } from './users/campusUsers.js';
import * as fs from 'fs';
import { scaleTeam } from './scaleTeam/scaleTeam.js';
import { core } from './core.js';

dotenv.config();

interface puhah {
  id: number;
  coalition_id: number;
  scoreable_id: number;
  scoreable_type: string;
  coalitions_user_id: number;
  calculation_id: number;
  value: number;
  reason: string;
  created_at: string;
  updated_at: string;
}

async function main() {
  const scaleTeams = await scaleTeam.getAll();
  await scaleTeam.save(scaleTeams);
}

main();

// 802
