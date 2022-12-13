const seoulCampusId: string = process.env.SEOUL_CAMPUS_ID || '29';
const maxPageSize: string = process.env.MAX_PAGE_SIZE || '100';

interface ApiDefine {
  [key: string]: string;
}

export const apiDefines: ApiDefine = {
  seoulCampusId,
  maxPageSize,
};
