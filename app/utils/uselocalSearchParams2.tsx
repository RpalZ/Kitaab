
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useMemo } from 'react'

export const useLocalSearchParams2 = <T = undefined,>(): T => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
    const navState = navigation.getState()
    const params = navState.routes?.[navState.index]?.params

    return useMemo(() => {
        if (isObjectMatchingType<T>(params)) {
            return params as T
        }
        return createUndefinedObject<T>()
    }, [params])
}

function isObjectMatchingType<T>(obj: unknown): obj is T {
    if (typeof obj !== 'object' || obj === null) return false

    return true
}

function createUndefinedObject<T>(): T {
    return new Proxy(
        {},
        {
            get: () => undefined,
        }
    ) as T
}

export default useLocalSearchParams2