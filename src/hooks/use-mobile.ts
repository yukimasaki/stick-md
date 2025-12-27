import * as React from "react"

const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
  // SSRとクライアントで同じ初期値を返す（Hydrationエラーを防ぐ）
  // 初期値はfalse（PC）として扱い、useEffectで正しい値を設定
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // クライアントサイドで即座に正しい値を設定
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
