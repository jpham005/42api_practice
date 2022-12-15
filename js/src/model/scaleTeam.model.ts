export type ScaleTeamFlag = {
  name: string;
  positive: boolean;
};

export type ScaleTeamUser = {
  id: number;
  login: string;
};

export interface ScaleTeamDto {
  id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  feedback: string;
  final_mark: number;
  flag: ScaleTeamFlag;
  begin_at: string;
  correcteds: Array<ScaleTeamUser>;
  corrector: ScaleTeamUser;
  filled_at: string;
  team: {
    id: number;
    name: string;
    url: string;
    final_mark: number;
    project_id: number;
    craeted_at: string;
    updated_at: string;
    status: string;
    users: [
      {
        id: number;
        login: string;
        url: string;
        leader: boolean;
        occurrence: number;
        validated: boolean;
        project_user_id: number;
      }
    ];
    'locked?': boolean;
    'validated?': boolean;
    'closed?': boolean;
    locked_at: string;
    closed_at: string;
    project_session_id: number;
    project_gitlab_path: string;
  };
}

export interface ScaleTeam {
  id: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  feedback: string;
  finalMark: number;
  flag: ScaleTeamFlag;
  beginAt: string;
  filledAt: string;
  correcteds: ScaleTeamUser[];
  corrector: ScaleTeamUser;
  // teamId: number;
  isPiscine: boolean;
}
