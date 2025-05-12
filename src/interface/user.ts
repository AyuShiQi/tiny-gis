import { Response } from '.'

interface GetUserInfoReq {
  token: string
}

export type GetUserInfoRes = Response<any>

export type GetUserInfo = (res: GetUserInfoReq) => Promise<GetUserInfoRes>
