import Taro, {
  Component,
  Config,
  useState,
  useEffect,
  usePullDownRefresh,
  useReachBottom
} from '@tarojs/taro'
import { View, Text, Block } from '@tarojs/components'
import './index.scss'
import useRequestWIthMore from '@/hooks/useRequestWIthMore'
import Empty from '@/components/empty'

import RepoItem from '@/components/repo-item'
import LoadMore from '@/components/load-more'
import {
  searchRepos,
  IRepoItem,
  ISearchPrams,
  ISearchUserItem
} from '@/services/search'
import { IStarred } from '@/services/user'
import { AtInput, AtSearchBar, AtSegmentedControl, AtTag } from 'taro-ui'
import { searchUsers } from '../../../services/search'
import Author from '@/components/author'
import { setGlobalData, getGlobalData } from '../../../utils/global_data'
import { ITouchEvent } from '@tarojs/components/types/common'

const Search = () => {
  const [searchValue, setSearchValue] = useState('')
  const [value, setValue] = useState('')
  const [searchReposParams, setSearchReposParams] = useState<ISearchPrams>({
    q: '',
    sort: '',
    order: '',
    per_page: 30,
    page: 1
  })
  const [searchUsersParams, setSearchUsersParams] = useState<ISearchPrams>({
    q: '',
    sort: '',
    order: '',
    per_page: 30,
    page: 1
  })

  const [repoList, setRepoList] = useState<IRepoItem[] | null>(null)
  const [userList, setUserList] = useState<ISearchUserItem[] | null>(null)
  const [current, setCurrent] = useState(0)
  const [hasMoreRepos, setHasMoreRepos] = useState(true)
  const [hasMoreUsers, setHasMoreUsers] = useState(true)
  const [hisotry, setHistory] = useState<string[]>([])

  const isRepo = () => {
    return current === 0
  }

  useEffect(() => {
    const history = getGlobalData('search_history') as string[]
    console.log('history: ', history)
    setHistory(history)
  }, [])

  const getRepos = () => {
    searchRepos({ ...searchReposParams, q: searchValue }).then(data => {
      if (data) {
        if (repoList) {
          setRepoList([...repoList, ...data])
        } else {
          setRepoList(data)
        }
        if (data.length < searchReposParams.per_page!) {
          setHasMoreRepos(false)
        }
      }
    })
  }

  const getUsers = () => {
    searchUsers({ ...searchUsersParams, q: searchValue }).then(data => {
      if (data) {
        if (userList) {
          setUserList([...userList, ...data])
        } else {
          setUserList(data)
        }
        if (data.length < searchUsersParams.per_page!) {
          setHasMoreUsers(false)
        }
      }
    })
  }

  useEffect(() => {
    if (searchValue) {
      getRepos()
    }
  }, [searchReposParams])

  useEffect(() => {
    if (searchValue) {
      getUsers()
    }
  }, [searchUsersParams])

  useEffect(() => {
    if (searchValue) {
      if (isRepo() && (!repoList || searchReposParams.q !== searchValue)) {
        setSearchReposParams({ ...searchReposParams, q: searchValue })
      } else if (!userList || searchUsersParams.q !== searchValue) {
        setSearchUsersParams({ ...searchUsersParams, q: searchValue })
      }
    }
  }, [current])

  usePullDownRefresh(() => {
    if (isRepo()) {
      setHasMoreRepos(true)
      setSearchReposParams({ ...searchReposParams, page: 1 })
    } else {
      setHasMoreUsers(true)
      setSearchUsersParams({ ...searchUsersParams, page: 1 })
    }
  })

  useReachBottom(() => {
    getMoreData()
  })

  const getMoreData = () => {
    if (isRepo()) {
      setSearchReposParams(searchReposParams => {
        return {
          ...searchReposParams,
          page: searchReposParams.page! + 1
        }
      })
    } else {
      setSearchUsersParams(searchUsersParams => {
        console.log('searchUsersParams: ', searchUsersParams)
        return {
          ...searchUsersParams,
          page: searchUsersParams.page! + 1
        }
      })
    }
  }

  const onChange = (val: string) => {
    setValue(val)
  }

  const onClear = () => {
    setValue('')
    setSearchValue('')
  }
  const updateParams = (q: string) => {
    // TODO
    setSearchValue(q)
    if (isRepo()) {
      setSearchReposParams({ ...searchReposParams, q })
    } else {
      setSearchUsersParams({ ...searchUsersParams, q })
    }
  }
  const onActionClick = () => {
    if (!value) {
      return
    }
    updateParams(value)
    const newHistory = [...new Set([...hisotry, value])]

    setHistory(newHistory)
    setTimeout(() => {
      setGlobalData('search_history', newHistory)
    }, 100)
  }

  const handleSegmentedControlClick = (index: number) => {
    setCurrent(index)
  }

  const handleTagClick = ({ name }) => {
    setValue(name)
    updateParams(name)
  }

  return (
    <View className="wrap">
      <View className="search-wrap">
        <AtSearchBar
          placeholder="search"
          actionName="GO"
          value={value}
          onClear={onClear}
          onChange={onChange}
          onActionClick={onActionClick}
        />
      </View>
      <View className="sc">
        <AtSegmentedControl
          values={['Repositories', 'Users']}
          onClick={handleSegmentedControlClick}
          current={current}
        />
      </View>
      <View>
        {searchValue ? (
          isRepo() ? (
            <View>
              {repoList ? (
                <Block>
                  <View>
                    {repoList ? (
                      repoList.map((item, idx) => {
                        return (
                          <RepoItem
                            key={item.id}
                            repo={item as IStarred}
                          ></RepoItem>
                        )
                      })
                    ) : (
                      <Empty></Empty>
                    )}
                  </View>
                  {repoList && <LoadMore hasMore={hasMoreRepos!}></LoadMore>}
                </Block>
              ) : (
                <Empty></Empty>
              )}
            </View>
          ) : (
            <View>
              {userList ? (
                <Block>
                  {userList.map(item => {
                    const login = item.login
                    const avatar_url = item.avatar_url
                    return (
                      <View key={login} className="user-item">
                        <Author login={login} url={avatar_url}></Author>
                      </View>
                    )
                  })}
                  {userList && <LoadMore hasMore={hasMoreUsers!}></LoadMore>}
                </Block>
              ) : (
                <Empty></Empty>
              )}
            </View>
          )
        ) : (
          <View className="history-tags">
            {hisotry.map(item => {
              return (
                <View key={item} className="tag">
                  <AtTag
                    name={item}
                    type="primary"
                    customStyle={{ background: '#fff' }}
                    circle
                    onClick={handleTagClick}
                  >
                    {item}
                  </AtTag>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </View>
  )
}

export default Search
