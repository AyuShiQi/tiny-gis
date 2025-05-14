export interface TokenHeader {
  token: string
}

export interface LoginReq {
  username: string
  password: string
}

export interface RegisterReq {
  username: string
  password: string
}

export interface RenameReq extends TokenHeader {
  username: string
}

export interface UpdatePasswordReq extends TokenHeader {
  oldPassword: string
  newPassword: string
}
