import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
export const dataManagementFilter = (
  regionId: string[],
  areaId: string[],
  territoryId: string[],
  townId: string[],
  userTowns?: ObjectId[] | string[],
) => {
  let townQuery: any = {};
  if (userTowns && userTowns.length) {
    townQuery = {
      ...townQuery,
      _id: {
        $in: userTowns.map((v) => new Types.ObjectId(v)),
      },
    };
  }

  if (townId && townId.length) {
    townQuery = {
      ...townQuery,
      _id: {
        $in: townId.map((v) => new Types.ObjectId(v)),
      },
    };
  }
  if (territoryId && territoryId.length) {
    townQuery = {
      ...townQuery,
      territoryId: {
        $in: territoryId.map((v) => new Types.ObjectId(v)),
      },
    };
  }
  if (areaId && areaId.length) {
    townQuery = {
      ...townQuery,
      areaId: {
        $in: areaId.map((v) => new Types.ObjectId(v)),
      },
    };
  }
  if (regionId && regionId.length) {
    townQuery = {
      ...townQuery,
      regionId: {
        $in: regionId.map((v) => new Types.ObjectId(v)),
      },
    };
  }
  return townQuery;
};
