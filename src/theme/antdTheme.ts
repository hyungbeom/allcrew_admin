import { theme } from "antd";

export const antdTheme = {
  token: {
    colorPrimary: "#1677ff",
    colorBgLayout: "#ffffff",
    borderRadius: 6,
    borderRadiusLG: 8,
    fontFamily:
      'var(--font-noto-sans-kr), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  algorithm: theme.defaultAlgorithm,
  components: {
    Layout: {
      siderBg: "#ffffff",
      headerBg: "#ffffff",
      headerHeight: 56,
      bodyBg: "#ffffff",
    },
    Menu: {
      fontSize: 14,
      itemBorderRadius: 4,
      subMenuItemBorderRadius: 4,
      itemMarginInline: 8,
      itemMarginBlock: 4,
      subMenuItemBg: "transparent",
      itemColor: "rgba(0, 0, 0, 0.65)",
      itemHoverColor: "rgba(0, 0, 0, 0.88)",
      itemSelectedBg: "#e6f4ff",
      itemSelectedColor: "#1677ff",
      itemHoverBg: "transparent",
      iconSize: 14,
    },
    Card: {
      paddingLG: 20,
    },
  },
};
