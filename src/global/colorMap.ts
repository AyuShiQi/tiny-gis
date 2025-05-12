import { Color } from 'cesium'

export const CesiumColorMapping: { [key: string]: Color } = {
  red: Color.RED,
  green: Color.GREEN,
  blue: Color.BLUE,
  yellow: Color.YELLOW,
  white: Color.WHITE,
  black: Color.BLACK,
  orange: Color.ORANGE,
  purple: Color.PURPLE,
  cyan: Color.CYAN,
  magenta: Color.MAGENTA,
  light: new Color(18, 204, 164)
}

export type CesiumColor = 'red' | 'green' | 'blue' | 'yellow' | 'white' | 'black' | 'orange' | 'purple' | 'cyan' | 'magenta'

// 使用 ColorName 类型
export const getCesiumColorByName = (colorName: CesiumColor): Color => {
  return CesiumColorMapping[colorName] || Color.WHITE // 如果找不到，默认返回白色
}
