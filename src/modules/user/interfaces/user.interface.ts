import { ObjectId } from 'mongodb';

export interface IUser {
  _id: ObjectId;
  name: string;
  username: string;
  password: string;
  usercode?: string;
  kind: 'CM' | 'DFF' | 'WMA' | 'CC' | 'MTCM' | 'Agency' | 'MS' | 'RC' | 'Admin';
  designation?: string;
  townsId: ObjectId[];
  msId: ObjectId[];
  projectAccess: string[];
  landingPage?: ObjectId;
  town?: ObjectId[];
  phone?: string;
  email?: string;
  supervisor?: ObjectId;
  locked: boolean;
  requireNewPassword?: boolean;
  attempt: number;
  image: { original: string; thumb: string };
  setting?: { refreshTime: number; sessionTimeOut: number };
  device?: { id: string; name: string };
  modifier: string | ObjectId;
  deletedAt: null;
  createdAt?: Date;
  updatedAt?: Date;
  joiningDate?: Date;
}
