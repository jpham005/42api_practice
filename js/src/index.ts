import * as dotenv from 'dotenv';
import { appDefine } from './model/appDefine.model.js';
import { campusUsers } from './users/campusUsers.js';
import * as fs from 'fs';

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
  const filehandler = await fs.promises.open('./temp.json');
  const result = await filehandler.readFile({ encoding: 'utf-8' });
  const resultJson: puhah[] = JSON.parse(result);

  let sum = 0;
  resultJson.forEach((curr) => {
    sum += Math.floor((curr.value + 6.2) / 6.3);
  });

  console.log(sum);
}

main();
