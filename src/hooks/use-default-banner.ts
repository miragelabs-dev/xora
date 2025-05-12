import { useTheme } from "next-themes"

export const useDefaultBanner = () => {
    const { resolvedTheme } = useTheme()

    return resolvedTheme === 'dark' ? '/defaults/banner.jpeg' : '/defaults/banner-light.jpeg'
}