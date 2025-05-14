export const titleRules = [{ rule: /./, info: '请输入标题' }]

export const coordinatesRules = [{ rule: /./, info: '请输入坐标' }]
export const radiusRules = [
  { rule: /./, info: '请输入半径' },
  { rule: /^[1-9]\d*$/, info: '请输入一个正整数' },
  { rule: /^(?:[1-9]\d{0,6}|10000000)(?:\.\d+)?$/, info: '最大不可超过10000000米' }
]

export const needModulesRules = [{ rule: /./, info: '请选择是否使用场景' }]

export const modulesIDRules = [{ rule: /./, info: '请选择使用场景' }]

export const lonRules = { rule: /^[-+]?((1[0-7]\d)|([1-9]?\d)|180)(\.\d+)?$/, info: '经度不合规' }
export const latRules = { rule: /^[-+]?([1-8]?\d|90)(\.\d+)?$/, info: '纬度不合规' }

export const usernameRules = [{ rule: /^[a-zA-Z0-9_]{4,10}$/, info: '用户名为4-10个字符' }]
export const passwordRules = [{ rule: /^[\S]{8,15}$/, info: '密码为8-15个字符' }]

export const usernameLRules = [{ rule: /./, info: '请输入用户名' }]
export const passwordLRules = [{ rule: /./, info: '请输入密码' }]
