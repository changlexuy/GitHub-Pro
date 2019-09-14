import { LanguageParams } from '../pages/trending/index'
import Taro from '@tarojs/taro'
import { IUserInfo } from '../services/user'

interface GlobalData {
  myLangs: LanguageParams[]
  authorization: string
  userInfo: IUserInfo
  username: string
  search_history: string[]
}
type globalDataKey = keyof GlobalData

const defaultLangs = [
  {
    language: '',
    title: 'All Languages'
  },
  {
    language: 'java',
    title: 'Java'
  },
  {
    language: 'javascript',
    title: 'JavaScript'
  },
  {
    language: 'typescript',
    title: 'TypeScript'
  }
]

const globalData: GlobalData = {
  myLangs: Taro.getStorageSync('myLangs') || defaultLangs,
  authorization: Taro.getStorageSync('authorization') || '',
  userInfo: Taro.getStorageSync('userInfo') || null,
  username: Taro.getStorageSync('username') || '',
  search_history: Taro.getStorageSync('search_history') || []
}

export const setGlobalData = (key: globalDataKey, val: any) => {
  globalData[key] = val
  try {
    Taro.setStorageSync(key, val)
  } catch (e) {
    console.log(`set key ${key} error: `, e)
  }
}
export const getGlobalData = (key: globalDataKey) => {
  return globalData[key]
}
